"use client"

import type React from "react"
import { useEffect } from "react"
import InstallPwaPrompt from "@/components/install-pwa-prompt"

export default function PageClient({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const checkUpdates = async () => {
      try {
        await fetch("/api/check-updates")
      } catch (error) {
        console.error("Erro ao verificar atualizações:", error)
      }
    }

    checkUpdates()
    const interval = setInterval(checkUpdates, 5 * 60 * 1000)

    if (
      "serviceWorker" in navigator &&
      (window.location.protocol === "https:" ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1")
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registrado com sucesso:", registration)
        })
        .catch((error) => {
          console.error("Falha ao registrar Service Worker:", error)
        })
    }

    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <>
      <InstallPwaPrompt />
      {children}
    </>
  )
}
