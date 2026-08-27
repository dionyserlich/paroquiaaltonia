"use client"

import { useEffect } from "react"

// Desregistra qualquer service worker antigo e limpa caches dele — precisa
// rodar em TODA página (por isso fica no layout raiz, não em PageClient, que
// não é usado por todas as rotas). Visitantes que ainda tiverem um SW de
// antes do kill-switch (public/sw.js) ficavam presos servindo HTML/CSS
// desatualizado até caírem numa das poucas páginas que faziam essa limpeza.
export default function ServiceWorkerCleanup() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return
    navigator.serviceWorker
      .getRegistrations()
      .then(async (registrations) => {
        for (const registration of registrations) {
          try {
            await registration.unregister()
          } catch {}
        }
        if ("caches" in window) {
          try {
            const keys = await caches.keys()
            await Promise.all(keys.map((k) => caches.delete(k)))
          } catch {}
        }
      })
      .catch(() => {})
  }, [])

  return null
}
