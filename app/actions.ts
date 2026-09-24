"use server"

import { headers } from "next/headers"
import webpush, {
  type PushSubscription as WebPushSubscription,
  type WebPushError,
} from "web-push"
import { query } from "@/app/lib/db"
import { payloadClient } from "@/app/lib/payload"
import { isValidSubscription, upsertPushSubscription } from "@/app/lib/push-subscriptions"
import { descreverErro, registrarNotificacao, registrarResultado } from "@/app/lib/notification-log"
import {
  dispararParaTodos,
  ensureVapid,
  opcoesDeEnvio,
  type OpcoesNotificacao,
} from "@/app/lib/push-broadcast"

// Lembrete sobre este arquivo: "use server" faz de CADA função exportada aqui
// um endpoint POST que o Next registra e expõe por um identificador de ação —
// chamável de fora, sem passar por nenhuma tela do site. Então nada é
// exportado daqui sem que a pergunta "e se um estranho chamar isso?" tenha uma
// resposta escrita.
//
// Reexportado como tipo (não vira endpoint: `export type` é apagado na
// compilação) porque app/lib/notification-options.ts importa daqui desde
// antes de a lógica de envio mudar de arquivo.
export type { OpcoesNotificacao }

type Sub = { endpoint: string; keys: { p256dh: string; auth: string }; deviceId?: string | null }

export async function subscribe(subscription: Sub) {
  try {
    if (!isValidSubscription(subscription)) {
      return { success: false, error: "Inscrição inválida" }
    }
    await upsertPushSubscription(subscription)
    return { success: true }
  } catch (error) {
    console.error("Erro ao inscrever:", error)
    return { success: false, error: "Falha ao inscrever para notificações" }
  }
}

// Apaga a inscrição sem exigir prova de posse, e fica assim de propósito. O
// endpoint é uma URL longa e aleatória emitida pelo serviço de push (FCM,
// Mozilla) e nunca é publicada em lugar nenhum: quem não tem o endpoint não
// consegue adivinhar nem enumerar. Quem TEM o endpoint de alguém é, na
// prática, quem já está com o aparelho ou o navegador da pessoa na mão.
//
// E o pior caso é pequeno e reversível: a pessoa para de receber push e
// reativa tocando no sino de novo (o navegador manda a inscrição outra vez).
// Nada é destruído e nenhum dado é exposto. Exigir autenticação aqui, ao
// contrário, quebraria o cancelamento para o fiel comum, que nunca tem login
// no CMS — o remédio sairia mais caro que a doença.
export async function unsubscribe(endpoint: string) {
  try {
    await query(`DELETE FROM bot.push_subscriptions WHERE endpoint=$1`, [endpoint])
    return { success: true }
  } catch (error) {
    console.error("Erro ao cancelar inscrição:", error)
    return { success: false, error: "Falha ao cancelar inscrição" }
  }
}

// Disparo em massa exposto como Server Action: aqui só entra quem tem sessão
// do CMS. Sem essa conferência, esta função era um endpoint anônimo capaz de
// mandar notificação com título, corpo e URL arbitrários para TODAS as
// inscrições em nome da paróquia — phishing com credibilidade máxima e sem
// desfazer. Não havia exploração conhecida só porque nenhum componente
// cliente importava a ação; isso não é proteção, é sorte.
//
// O envio em si vive em app/lib/push-broadcast.ts (módulo comum, sem
// "use server"), que é de onde os hooks das collections, o cron e o bot da
// missa chamam — eles rodam no servidor e não têm sessão nenhuma.
export async function sendNotificationToAll(
  title: string,
  body: string,
  url = "/",
  opcoes: OpcoesNotificacao = {}
) {
  const payload = await payloadClient()
  // Mesma verificação de app/api/admin/transmissao-ao-vivo/route.ts; numa
  // Server Action os headers (com o cookie de sessão do Payload) vêm de
  // headers(), que é assíncrono no Next 16.
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) {
    console.warn("[push] disparo em massa recusado: sem sessão do CMS")
    return { success: false, error: "Não autorizado" }
  }

  return dispararParaTodos(title, body, url, opcoes)
}

// Notificação pra uma única inscrição — usada pelo cron de velas
// (app/api/cron/check-velas-expiradas/route.ts) pra avisar só quem acendeu
// quando a própria vela apaga, nunca todo mundo.
//
// Continua sem exigir sessão, pelo mesmo raciocínio de unsubscribe acima: só
// atinge quem já teve o endpoint (URL longa e aleatória, nunca publicada)
// vazado, um aparelho por vez, e é o cron — sem login — que chama. O disparo
// em massa é que muda de patamar, porque alcança todo mundo de uma vez.
export async function sendNotificationToOne(
  endpoint: string,
  title: string,
  body: string,
  url = "/",
  opcoes: OpcoesNotificacao = {}
) {
  // Igual ao broadcast, o registro vem primeiro e vale por si — mas aqui
  // amarrado ao aparelho, pra este aviso aparecer só no histórico de quem
  // acendeu a vela, e não no de todo mundo.
  const logId = await registrarNotificacao({ title, body, url, endpoint })

  try {
    if (!ensureVapid()) {
      return { success: false, error: "VAPID keys não configuradas" }
    }
    const { rows } = await query<{ endpoint: string; p256dh: string; auth: string }>(
      `SELECT endpoint, p256dh, auth FROM bot.push_subscriptions WHERE endpoint = $1`,
      [endpoint]
    )
    const sub = rows[0]
    if (!sub) {
      return { success: false, error: "Inscrição não encontrada" }
    }

    const subscription: WebPushSubscription = { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }
    const payload = JSON.stringify({ title, body, url, tag: opcoes.tag })
    await webpush.sendNotification(subscription, payload, opcoesDeEnvio(opcoes))
    await registrarResultado(logId, 1, 0)
    return { success: true }
  } catch (error) {
    const webPushError = error as Partial<WebPushError>
    if (webPushError?.statusCode === 410 || webPushError?.statusCode === 404) {
      await query(`DELETE FROM bot.push_subscriptions WHERE endpoint = $1`, [endpoint])
    }
    console.error("Erro ao enviar notificação individual:", error)
    await registrarResultado(logId, 0, 1, descreverErro(error))
    return { success: false, error: "Falha ao enviar notificação" }
  }
}
