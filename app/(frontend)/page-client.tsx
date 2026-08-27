"use client"

import type React from "react"
import { useEffect, useState } from "react"
import AppLoading from "@/components/app-loading"
import InstallPwaPrompt from "@/components/install-pwa-prompt"

export default function PageClient({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600)

    const checkUpdates = async () => {
      try {
        await fetch("/api/check-updates")
      } catch (error) {
        console.error("Erro ao verificar atualizações:", error)
      }
    }
    checkUpdates()
    const interval = setInterval(checkUpdates, 5 * 60 * 1000)

    // Limpeza do service worker antigo agora roda em app/(frontend)/layout.tsx
    // (via ServiceWorkerCleanup), pra valer em toda página, não só nas que
    // usam PageClient.

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
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
