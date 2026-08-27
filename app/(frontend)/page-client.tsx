"use client"

import type React from "react"
import { useEffect, useState } from "react"
import AppLoading from "@/components/app-loading"
import InstallPwaPrompt from "@/components/install-pwa-prompt"

export default function PageClient({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)

    // Notificações agora são disparadas por evento (hooks do Payload em
    // noticias/eventos, transição de missa ao vivo), não por polling —
    // ver app/actions.ts e collections/Noticias.ts / Eventos.ts.
    // Registro do service worker roda em app/(frontend)/layout.tsx (via
    // ServiceWorkerRegister), pra valer em toda página, não só nas que
    // usam PageClient.

    return () => {
      clearTimeout(timer)
    }
  }, [])

  return (
    <>
      {isLoading && <AppLoading />}
      <InstallPwaPrompt />
      {children}
    </>
  )
}
