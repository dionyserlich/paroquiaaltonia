import webpush, {
  type PushSubscription as WebPushSubscription,
  type RequestOptions,
  type Urgency,
  type WebPushError,
} from "web-push"
import { query } from "@/app/lib/db"
import { descreverErro, registrarNotificacao, registrarResultado } from "@/app/lib/notification-log"
import { slugify } from "@/lib/slugify"

// O envio de notificação para TODOS mora aqui, e não em app/actions.ts, por um
// motivo de segurança e não de organização: em um arquivo "use server" toda
// função exportada vira um endpoint POST que o Next publica e qualquer pessoa
// na internet pode chamar. Enquanto o disparo em massa era uma função
// exportada de lá, a única coisa que impedia um estranho de mandar push com
// título, texto e URL arbitrários em nome da paróquia era o fato de nenhum
// componente cliente importar a ação (o identificador dela não ia pro bundle)
// — proteção acidental, que cairia no primeiro import de um componente
// cliente. Phishing com a credibilidade da paróquia, e sem volta: notificação
// entregue não se apaga.
//
// Com a lógica num módulo comum, quem chama de dentro do servidor (hooks das
// collections, cron, bot da missa) importa daqui direto, e app/actions.ts fica
// só com a versão exposta, que confere a sessão do CMS antes de delegar. Este
// arquivo NÃO pode receber "use server": é exatamente isso que o mantém fora
// da superfície pública.

let vapidConfigured = false
export function ensureVapid() {
  if (vapidConfigured) return true
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const priv = process.env.VAPID_PRIVATE_KEY
  if (!pub || !priv) return false
  // Endereço de contato que os serviços de push (Google, Mozilla) usam pra
  // avisar sobre problemas de entrega — precisa ser um e-mail que alguém
  // realmente leia. Trocar isto não invalida nenhuma inscrição existente:
  // só o par de chaves VAPID identifica o remetente.
  webpush.setVapidDetails("mailto:contato@paroquiaaltonia.com.br", pub, priv)
  vapidConfigured = true
  return true
}

export type OpcoesNotificacao = {
  // Por quanto tempo o serviço de push guarda a mensagem enquanto o
  // aparelho está offline. O padrão da biblioteca são QUATRO SEMANAS, o que
  // aqui seria sempre errado: "Missa ao vivo agora!" entregue dias depois é
  // ruído, não aviso. Por isso todo envio define um prazo próprio.
  ttlSegundos?: number
  urgencia?: Urgency
  // Mensagens com o mesmo tópico substituem as anteriores ainda pendentes
  // no serviço de push, em vez de acumular (máx. 32 caracteres).
  topico?: string
  // Agrupa na bandeja do aparelho: uma notificação com a mesma tag substitui
  // a anterior em vez de empilhar.
  tag?: string
}

// Um dia. Vale pra avisos sem prazo próprio — bem menos que as quatro
// semanas da biblioteca, que nenhum aviso desta paróquia justifica.
const TTL_PADRAO_SEGUNDOS = 86400

// Envios são disparados em lotes em vez de todos de uma vez. Com poucas
// inscrições dá no mesmo, mas se a paróquia crescer, abrir uma conexão
// simultânea por inscrição esgotaria os limites da função serverless.
const TAMANHO_LOTE = 50

// O cabeçalho `topic` só aceita até 32 caracteres do conjunto Base64 seguro
// para URL (letras, números, - e _). A biblioteca LANÇA EXCEÇÃO diante de
// qualquer outra coisa — e como o mesmo objeto de opções é usado em todos os
// envios, um tópico com espaço ou acento derruba a notificação inteira, pra
// todo mundo, e não só pra um destinatário.
//
// Isso aconteceu de verdade: avisos escritos pelo painel com "Iniciamos o
// Ofertório" no campo Tópico falharam para 100% das inscrições. Como o campo
// é preenchido por pessoas, e não por código, sanear aqui é obrigatório —
// nenhum texto digitado deve ser capaz de impedir a entrega.
function sanitizarTopico(topico: string | undefined): string | undefined {
  if (!topico) return undefined
  const limpo = slugify(topico).slice(0, 32).replace(/-+$/, "")
  return limpo || undefined
}

export function opcoesDeEnvio(opcoes: OpcoesNotificacao): RequestOptions {
  const topico = sanitizarTopico(opcoes.topico)
  return {
    TTL: opcoes.ttlSegundos ?? TTL_PADRAO_SEGUNDOS,
    urgency: opcoes.urgencia ?? "normal",
    ...(topico ? { topic: topico } : {}),
  }
}

// Disparo em massa de verdade, sem nenhuma verificação de quem pediu — por
// isso não é exportado como Server Action. Só código do servidor chega aqui:
// hooks de Avisos/Eventos/Missas/Noticias, o bot da missa ao vivo e a action
// sendNotificationToAll (que confere a sessão do CMS antes).
export async function dispararParaTodos(
  title: string,
  body: string,
  url = "/",
  opcoes: OpcoesNotificacao = {}
) {
  // Grava no histórico ANTES de tentar enviar, e independente do resultado:
  // o push é só um canal de entrega, o registro é a notificação em si. Sem
  // isso, quem não ativou o sino (a maioria) e quem está no iPhone sem a
  // PWA instalada nunca ficaria sabendo do anúncio.
  const logId = await registrarNotificacao({ title, body, url })

  try {
    if (!ensureVapid()) {
      return { success: false, error: "VAPID keys não configuradas" }
    }
    const { rows } = await query<{ endpoint: string; p256dh: string; auth: string }>(
      `SELECT endpoint, p256dh, auth FROM bot.push_subscriptions`
    )
    const payload = JSON.stringify({ title, body, url, tag: opcoes.tag })
    const envio = opcoesDeEnvio(opcoes)

    const results: PromiseSettledResult<unknown>[] = []
    for (let i = 0; i < rows.length; i += TAMANHO_LOTE) {
      const lote = rows.slice(i, i + TAMANHO_LOTE)
      const resultadosDoLote = await Promise.allSettled(
        lote.map((s) => {
          const subscription: WebPushSubscription = {
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh, auth: s.auth },
          }
          return webpush.sendNotification(subscription, payload, envio)
        })
      )
      results.push(...resultadosDoLote)
    }

    // Limpar inscrições com 410 Gone
    const expiredEndpoints: string[] = []
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        const reason = r.reason as Partial<WebPushError> | undefined
        if (reason?.statusCode === 410 || reason?.statusCode === 404) {
          expiredEndpoints.push(rows[i].endpoint)
        }
      }
    })
    if (expiredEndpoints.length) {
      await query(`DELETE FROM bot.push_subscriptions WHERE endpoint = ANY($1::text[])`, [expiredEndpoints])
    }

    const sent = results.filter((r) => r.status === "fulfilled").length
    const failed = results.filter((r) => r.status === "rejected").length
    // Fecha a lacuna que apareceu quando não deu pra saber se a notificação
    // da missa de domingo tinha sido entregue: agora fica registrado quantos
    // envios saíram, quantos falharam e — quando falham — por quê.
    const primeiraFalha = results.find((r) => r.status === "rejected")
    await registrarResultado(
      logId,
      sent,
      failed,
      primeiraFalha ? descreverErro((primeiraFalha as PromiseRejectedResult).reason) : null
    )

    return { success: true, sent, failed }
  } catch (error) {
    console.error("Erro ao enviar notificações:", error)
    return { success: false, error: "Falha ao enviar notificações" }
  }
}
