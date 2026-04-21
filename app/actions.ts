"use server"

import webpush, { type PushSubscription as WebPushSubscription, type WebPushError } from "web-push"
import { query } from "@/app/lib/db"

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

type Sub = { endpoint: string; keys: { p256dh: string; auth: string } }

export async function subscribe(subscription: Sub) {
  try {
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return { success: false, error: "Inscrição inválida" }
    }
    await query(
      `INSERT INTO push_subscriptions (endpoint, p256dh, auth)
       VALUES ($1,$2,$3)
       ON CONFLICT (endpoint) DO NOTHING`,
      [subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth]
    )
    return { success: true }
  } catch (error) {
    console.error("Erro ao inscrever:", error)
    return { success: false, error: "Falha ao inscrever para notificações" }
  }
}

export async function unsubscribe(endpoint: string) {
  try {
    await query(`DELETE FROM push_subscriptions WHERE endpoint=$1`, [endpoint])
    return { success: true }
  } catch (error) {
    console.error("Erro ao cancelar inscrição:", error)
    return { success: false, error: "Falha ao cancelar inscrição" }
  }
}

export async function sendNotificationToAll(title: string, body: string, url = "/") {
  try {
    if (!ensureVapid()) {
      return { success: false, error: "VAPID keys não configuradas" }
    }
    const { rows } = await query<{ endpoint: string; p256dh: string; auth: string }>(
      `SELECT endpoint, p256dh, auth FROM push_subscriptions`
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
      await query(`DELETE FROM push_subscriptions WHERE endpoint = ANY($1::text[])`, [expiredEndpoints])
    }

    return {
      success: true,
      sent: results.filter((r) => r.status === "fulfilled").length,
      failed: results.filter((r) => r.status === "rejected").length,
    }
  } catch (error) {
    console.error("Erro ao enviar notificações:", error)
    return { success: false, error: "Falha ao enviar notificações" }
  }
}
