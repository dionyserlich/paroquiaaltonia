import { query } from "@/app/lib/db"

// Histórico de notificações. O modelo segue o padrão usual desses sistemas:
// o push NÃO é a notificação — a notificação é este registro, e o push é
// apenas um dos canais de entrega dela.
//
// Consequência prática do que motivou isto: o registro é gravado mesmo
// quando não há nenhuma inscrição push, quando o envio falha, ou quando a
// pessoa nunca autorizou notificações. Assim quem está no iPhone sem a PWA
// instalada (que não recebe push de jeito nenhum) ou quem simplesmente
// nunca ativou o sino continua vendo o que foi anunciado.
//
// Fica no schema `bot` junto de push_subscriptions, e não como collection do
// Payload, porque é estado interno de entrega e não conteúdo editorial —
// mesma separação já adotada no projeto (ver app/lib/db.ts).

export type NotificationLogEntry = {
  id: number
  title: string
  body: string
  url: string
  createdAt: string
  // true quando o aviso foi dirigido só a este aparelho (ex.: "sua vela
  // apagou"), false quando foi um anúncio geral da paróquia.
  pessoal: boolean
}

type RegistrarInput = {
  title: string
  body: string
  url: string
  // Ausente num anúncio geral; preenchido quando o aviso é individual.
  endpoint?: string | null
}

// Grava a notificação e devolve o id, pra que o resultado real do envio
// possa ser anexado depois (registrarResultado). Nunca lança: falhar em
// gravar o histórico não pode impedir o envio em si.
export async function registrarNotificacao(input: RegistrarInput): Promise<number | null> {
  try {
    // Resolve o aparelho a partir do endpoint no momento da gravação. O
    // endpoint pode ser trocado pelo navegador mais tarde; o device_id é
    // estável, então é ele que mantém o histórico ligado à pessoa certa.
    let deviceId: string | null = null
    if (input.endpoint) {
      const { rows } = await query<{ device_id: string | null }>(
        `SELECT device_id FROM bot.push_subscriptions WHERE endpoint = $1`,
        [input.endpoint]
      )
      deviceId = rows[0]?.device_id ?? null
    }

    const { rows } = await query<{ id: number }>(
      `INSERT INTO bot.notification_log (title, body, url, device_id, endpoint)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [input.title, input.body, input.url, deviceId, input.endpoint ?? null]
    )
    return rows[0]?.id ?? null
  } catch (error) {
    console.error("Erro ao registrar notificação no histórico:", error)
    return null
  }
}

export async function registrarResultado(id: number | null, sent: number, failed: number): Promise<void> {
  if (id === null) return
  try {
    await query(`UPDATE bot.notification_log SET sent = $2, failed = $3 WHERE id = $1`, [id, sent, failed])
  } catch (error) {
    console.error("Erro ao registrar resultado do envio:", error)
  }
}

const LIMITE_PADRAO = 50
const JANELA_DIAS = 90

// Devolve os anúncios gerais mais os avisos individuais deste aparelho.
// Sem login: a identidade é o device_id gravado no navegador, com o
// endpoint atual como reforço pra não perder avisos gravados antes de o
// aparelho ter um device_id.
export async function listarNotificacoes(deviceId?: string | null, endpoint?: string | null) {
  const { rows } = await query<{
    id: number
    title: string
    body: string
    url: string
    created_at: Date
    device_id: string | null
    endpoint: string | null
  }>(
    `SELECT id, title, body, url, created_at, device_id, endpoint
     FROM bot.notification_log
     WHERE created_at >= now() - ($1 || ' days')::interval
       AND (
         (device_id IS NULL AND endpoint IS NULL)
         OR ($2::text IS NOT NULL AND device_id = $2)
         OR ($3::text IS NOT NULL AND endpoint = $3)
       )
     ORDER BY created_at DESC
     LIMIT ${LIMITE_PADRAO}`,
    [String(JANELA_DIAS), deviceId ?? null, endpoint ?? null]
  )

  return rows.map(
    (r): NotificationLogEntry => ({
      id: r.id,
      title: r.title,
      body: r.body,
      url: r.url,
      createdAt: r.created_at.toISOString(),
      pessoal: Boolean(r.device_id || r.endpoint),
    })
  )
}
