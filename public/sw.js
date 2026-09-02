// Service worker real — recebe notificações push e as exibe. Substitui o
// antigo kill-switch que se autodesregistrava (necessário à época para
// corrigir um loop de reload); a limpeza que ele fazia já rodou em todo
// visitante ativo, então agora este arquivo pode assumir o papel de verdade.
const NOTIFICATION_ICON = "/images/logo-icone.png"

// Mesma conversão de hooks/use-push-subscription.ts (duplicada de propósito:
// o service worker é um arquivo estático, sem acesso aos módulos do bundle).
// Suporte a passar a chave VAPID como string direto pro pushManager.subscribe
// é inconsistente entre navegadores; Uint8Array é aceito por todos.
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener("push", (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { body: event.data ? event.data.text() : "" }
  }

  const title = data.title || "Paróquia São Sebastião"
  const options = {
    body: data.body || "",
    icon: NOTIFICATION_ICON,
    badge: NOTIFICATION_ICON,
    data: { url: data.url || "/" },
  }

  event.waitUntil(
    (async () => {
      await self.registration.showNotification(title, options)

      // Avisa as janelas abertas do site pra que o contador do sino
      // atualize na hora. Sem isso, com o app já aberto (o caso comum numa
      // PWA, que é retomada em vez de recarregada) o histórico só era
      // buscado de novo depois de um recarregamento manual.
      const janelas = await self.clients.matchAll({ type: "window", includeUncontrolled: true })
      for (const janela of janelas) {
        janela.postMessage({ type: "push-recebido" })
      }
    })()
  )
})

// O navegador pode trocar a inscrição push por conta própria (renovação de
// token do FCM, atualização do Play Services, despejo de armazenamento) —
// muito mais comum no Android que no desktop. Quando isso acontece sem
// ninguém reinscrever, o servidor fica com o endpoint morto: o FCM aceita o
// envio com 201 e nada é entregue, e o sino continua mostrando "ativado"
// porque ele consulta o navegador, não o servidor.
//
// Rede de segurança, não a defesa principal: o suporte do Chrome a este
// evento é parcial e ele não dispara em todos os caminhos. A reconciliação
// que realmente sustenta é a re-sincronização a cada abertura do app, em
// hooks/use-push-subscription.ts.
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    (async () => {
      try {
        // A chave da inscrição anterior evita o round-trip; nem todo
        // navegador a fornece, daí o fallback pra rota.
        let applicationServerKey = event.oldSubscription?.options?.applicationServerKey
        if (!applicationServerKey) {
          const res = await fetch("/api/push/vapid-key")
          const { key } = await res.json()
          if (!key) return
          applicationServerKey = urlBase64ToUint8Array(key)
        }

        const subscription = await self.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        })

        const json = subscription.toJSON()
        if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return

        // Sem deviceId aqui: service worker não acessa localStorage. O
        // oldEndpoint cobre a limpeza neste caminho, e a próxima abertura
        // do app reconcilia pelo deviceId de qualquer forma.
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: json.endpoint,
            keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
            oldEndpoint: event.oldSubscription?.endpoint ?? null,
          }),
        })
      } catch (err) {
        console.error("Falha ao renovar inscrição push:", err)
      }
    })()
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url = event.notification.data?.url || "/"

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsList) => {
      for (const client of clientsList) {
        if (client.url === url && "focus" in client) return client.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
    })
  )
})
