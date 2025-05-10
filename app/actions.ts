"use server"

import webpush from "web-push"
import fs from "fs/promises"
import path from "path"

// Configurar as chaves VAPID (em produção, use variáveis de ambiente)
webpush.setVapidDetails(
  "mailto:contato@paroquiasaosebastiao.com.br",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || "",
)

// Armazenar as inscrições (em produção, use um banco de dados)
let subscriptions: PushSubscription[] = []

// Carregar inscrições do arquivo
async function loadSubscriptions() {
  try {
    const filePath = path.join(process.cwd(), "data", "subscriptions.json")
    const data = await fs.readFile(filePath, "utf8")
    subscriptions = JSON.parse(data)
  } catch (error) {
    console.error("Erro ao carregar inscrições:", error)
    subscriptions = []
  }
}

// Salvar inscrições no arquivo
async function saveSubscriptions() {
  try {
    const filePath = path.join(process.cwd(), "data", "subscriptions.json")
    await fs.writeFile(filePath, JSON.stringify(subscriptions, null, 2), "utf8")
  } catch (error) {
    console.error("Erro ao salvar inscrições:", error)
  }
}

// Inicializar carregando as inscrições
loadSubscriptions()

export async function subscribe(subscription: PushSubscription) {
  try {
    // Verificar se a inscrição já existe
    const exists = subscriptions.some((sub) => sub.endpoint === subscription.endpoint)

    if (!exists) {
      subscriptions.push(subscription)
      await saveSubscriptions()
    }

    return { success: true }
  } catch (error) {
    console.error("Erro ao inscrever:", error)
    return { success: false, error: "Falha ao inscrever para notificações" }
  }
}

export async function unsubscribe(endpoint: string) {
  try {
    subscriptions = subscriptions.filter((sub) => sub.endpoint !== endpoint)
    await saveSubscriptions()
    return { success: true }
  } catch (error) {
    console.error("Erro ao cancelar inscrição:", error)
    return { success: false, error: "Falha ao cancelar inscrição" }
  }
}

export async function sendNotificationToAll(title: string, body: string, url = "/") {
  try {
    const payload = JSON.stringify({
      title,
      body,
      url,
    })

    const results = await Promise.allSettled(
      subscriptions.map((subscription) => webpush.sendNotification(subscription, payload)),
    )

    // Filtrar inscrições inválidas
    const validSubscriptions = subscriptions.filter(
      (_, index) =>
        results[index].status !== "rejected" ||
        (results[index].status === "rejected" && (results[index] as PromiseRejectedResult).reason.statusCode !== 410),
    )

    if (validSubscriptions.length !== subscriptions.length) {
      subscriptions = validSubscriptions
      await saveSubscriptions()
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
