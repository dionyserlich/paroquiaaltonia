"use server"

import webpush, { type PushSubscription as WebPushSubscription, type WebPushError } from "web-push"
import { query } from "@/app/lib/db"
import { isValidSubscription, upsertPushSubscription } from "@/app/lib/push-subscriptions"
import { registrarNotificacao, registrarResultado } from "@/app/lib/notification-log"

let vapidConfigured = false
function ensureVapid() {
  if (vapidConfigured) return true
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const priv = process.env.VAPID_PRIVATE_KEY
  if (!pub || !priv) return false
  webpush.setVapidDetails("mailto:contato@paroquiasaosebastiao.com.br", pub, priv)
  vapidConfigured = true
  return true
}

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

export async function unsubscribe(endpoint: string) {
  try {
    await query(`DELETE FROM bot.push_subscriptions WHERE endpoint=$1`, [endpoint])
    return { success: true }
  } catch (error) {
    console.error("Erro ao cancelar inscrição:", error)
    return { success: false, error: "Falha ao cancelar inscrição" }
  }
}

export async function sendNotificationToAll(title: string, body: string, url = "/") {
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
    const payload = JSON.stringify({ title, body, url })

    const results = await Promise.allSettled(
      rows.map((s) => {
        const subscription: WebPushSubscription = {
          endpoint: s.endpoint,
          keys: { p256dh: s.p256dh, auth: s.auth },
        }
        return webpush.sendNotification(subscription, payload)
      })
    )

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
    // envios saíram e quantos falharam.
    await registrarResultado(logId, sent, failed)

    return { success: true, sent, failed }
  } catch (error) {
    console.error("Erro ao enviar notificações:", error)
    return { success: false, error: "Falha ao enviar notificações" }
  }
}

// Notificação pra uma única inscrição — usada pelo cron de velas
// (app/api/cron/check-velas-expiradas/route.ts) pra avisar só quem acendeu
// quando a própria vela apaga, nunca todo mundo.
export async function sendNotificationToOne(endpoint: string, title: string, body: string, url = "/") {
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
    const payload = JSON.stringify({ title, body, url })
    await webpush.sendNotification(subscription, payload)
    await registrarResultado(logId, 1, 0)
    return { success: true }
  } catch (error) {
    const webPushError = error as Partial<WebPushError>
    if (webPushError?.statusCode === 410 || webPushError?.statusCode === 404) {
      await query(`DELETE FROM bot.push_subscriptions WHERE endpoint = $1`, [endpoint])
    }
    console.error("Erro ao enviar notificação individual:", error)
    await registrarResultado(logId, 0, 1)
    return { success: false, error: "Falha ao enviar notificação" }
  }
}
