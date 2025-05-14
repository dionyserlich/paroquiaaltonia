"use client"

import type React from "react"
import { useEffect, useState } from "react"
import AppLoading from "@/components/app-loading"

export default function PageClient({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar atualizações a cada 5 minutos
    const checkUpdates = async () => {
      try {
        await fetch("/api/check-updates")
      } catch (error) {
        console.error("Erro ao verificar atualizações:", error)
      }
    }

    // Verificar imediatamente e depois a cada 5 minutos
    checkUpdates()
    const interval = setInterval(checkUpdates, 5 * 60 * 1000)

    // Registrar o service worker com segurança
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

    // Simular carregamento completo
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [])

  return (
    <>
      {isLoading && <AppLoading />}
      {children}
    </>
  )
}
