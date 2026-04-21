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

    if ("serviceWorker" in navigator) {
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
    }

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
