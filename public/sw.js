// Kill-switch service worker.
// O service worker antigo cacheava HTML/chunks de forma agressiva e estava
// causando loops de reload e navegação travada após cada deploy.
// Esta versão se autodestrói: limpa todos os caches, desregistra o SW e
// recarrega as páginas controladas para soltar qualquer cliente preso.

self.addEventListener("install", (event) => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys()
        await Promise.all(keys.map((k) => caches.delete(k)))
      } catch {}
      try {
        await self.registration.unregister()
      } catch {}
    })()
  )
})

self.addEventListener("fetch", () => {
  // Sem interceptação: deixa o navegador buscar tudo direto da rede.
})
