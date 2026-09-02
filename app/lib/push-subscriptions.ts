import { query } from "@/app/lib/db"

// Lógica de gravação da inscrição push, compartilhada entre a server action
// (app/actions.ts, chamada da página) e a rota HTTP
// (app/api/push/subscribe/route.ts, chamada do service worker — que não
// consegue invocar server actions).
export type PushSubscriptionInput = {
  endpoint: string
  keys: { p256dh: string; auth: string }
  // Identidade estável do navegador, gerada no cliente (lib/device-id.ts).
  // É o que permite substituir a inscrição antiga do MESMO aparelho quando
  // o navegador troca o endpoint por conta própria — sem isso, a linha
  // morta fica pra sempre no banco e o envio some no vazio (o FCM aceita
  // com 201 e não entrega). Ausente quando vem do service worker, que não
  // tem acesso ao localStorage.
  deviceId?: string | null
  // Endpoint anterior, quando o navegador informa qual foi substituído
  // (evento pushsubscriptionchange). Caminho alternativo de limpeza pra
  // quando não temos o deviceId.
  oldEndpoint?: string | null
}

export function isValidSubscription(input: unknown): input is PushSubscriptionInput {
  const sub = input as PushSubscriptionInput | undefined
  return Boolean(sub?.endpoint && sub?.keys?.p256dh && sub?.keys?.auth)
}

export async function upsertPushSubscription(input: PushSubscriptionInput): Promise<void> {
  const { endpoint, keys, deviceId, oldEndpoint } = input

  // Remove a inscrição anterior deste mesmo aparelho antes de gravar a nova.
  // Não usa ON CONFLICT porque o endpoint mudou — são linhas diferentes.
  if (deviceId) {
    await query(`DELETE FROM bot.push_subscriptions WHERE device_id = $1 AND endpoint <> $2`, [deviceId, endpoint])
  }
  if (oldEndpoint && oldEndpoint !== endpoint) {
    await query(`DELETE FROM bot.push_subscriptions WHERE endpoint = $1`, [oldEndpoint])
  }

  // DO UPDATE (não DO NOTHING como antes): re-sincronizar a cada abertura
  // do app só resolve se a linha existente for de fato atualizada — tanto
  // as chaves de criptografia quanto o last_seen_at, que é o que dá
  // visibilidade de quais inscrições ainda estão vivas.
  await query(
    `INSERT INTO bot.push_subscriptions (endpoint, p256dh, auth, device_id, last_seen_at)
     VALUES ($1, $2, $3, $4, now())
     ON CONFLICT (endpoint) DO UPDATE
       SET p256dh = EXCLUDED.p256dh,
           auth = EXCLUDED.auth,
           device_id = COALESCE(EXCLUDED.device_id, bot.push_subscriptions.device_id),
           last_seen_at = now()`,
    [endpoint, keys.p256dh, keys.auth, deviceId ?? null]
  )
}
