"use client"

import type React from "react"
import { useEffect } from "react"
import WelcomeBanner from "@/components/welcome-banner"
import { setUserProperty } from "@/lib/analytics"

export default function PageClient({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Notificações agora são disparadas por evento (hooks do Payload em
    // noticias/eventos, transição de missa ao vivo), não por polling —
    // ver app/actions.ts e collections/Noticias.ts / Eventos.ts.
    // Registro do service worker roda em app/(frontend)/layout.tsx (via
    // ServiceWorkerRegister), pra valer em toda página, não só nas que
    // usam PageClient.

    // PageClient roda em praticamente toda página — ponto único pra marcar,
    // uma vez por carregamento, se a visita veio do app instalado ou do
    // navegador comum. Mesma checagem de display-mode já usada em
    // welcome-banner.tsx/use-push-subscription.ts.
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    setUserProperty("modo_exibicao", isStandalone ? "pwa" : "navegador")
  }, [])

  return (
    <>
      <WelcomeBanner />
      {children}
    </>
  )
}
