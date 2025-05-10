"use client"

import type React from "react"

import { useEffect } from "react"
import RegisterSW from "./register-sw"

export default function PageClient({ children }: { children: React.ReactNode }) {
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

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <RegisterSW />
      {children}
    </>
  )
}
