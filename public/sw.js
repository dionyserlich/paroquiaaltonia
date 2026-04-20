// Service worker da Paróquia São Sebastião
// Estratégia: network-first para navegação (HTML) e APIs, cache-first
// apenas para imagens estáticas. Isso evita servir HTML/JS desatualizados
// após um deploy ou rebuild, que causariam tela em branco / preso em "Carregando...".

const CACHE_VERSION = "v3"
const STATIC_CACHE = `sao-sebastiao-static-${CACHE_VERSION}`

const STATIC_ASSETS = [
  "/images/logo-icone.png",
  "/images/imagem-principal-hero.png",
  "/images/live-icon.png",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS).catch(() => {}))
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE)
          .map((k) => caches.delete(k))
      )
      await self.clients.claim()
    })()
  )
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET") return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Navegação (HTML): sempre rede; só usa cache se estiver offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(request).then((r) => r || caches.match("/")) ||
        new Response("Offline", { status: 503, statusText: "Offline" })
      )
    )
    return
  }

  // Bundles do Next e APIs: sempre rede, sem cache.
  if (url.pathname.startsWith("/_next/") || url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(request))
    return
  }

  // Imagens e demais assets estáticos: cache-first com fallback de rede.
  if (request.destination === "image" || STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request)
          .then((res) => {
            if (res && res.ok) {
              const copy = res.clone()
              caches.open(STATIC_CACHE).then((c) => c.put(request, copy))
            }
            return res
          })
          .catch(() => cached)
      })
    )
    return
  }

  // Padrão: rede.
  event.respondWith(fetch(request))
})

self.addEventListener("push", (event) => {
  if (!event.data) return
  let data = {}
  try {
    data = event.data.json()
  } catch {
    data = { title: "Paróquia São Sebastião", body: event.data.text() }
  }
  const options = {
    body: data.body,
    icon: "/images/logo-icone.png",
    badge: "/images/logo-icone.png",
    vibrate: [100, 50, 100],
    data: { url: data.url || "/" },
  }
  event.waitUntil(self.registration.showNotification(data.title || "Aviso", options))
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.url || "/"
  event.waitUntil(self.clients.openWindow(targetUrl))
})
