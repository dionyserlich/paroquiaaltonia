"use client"

import { useCallback, useRef } from "react"

// Mesmo mecanismo já usado em components/explicacao-leitura.tsx (lá inline,
// aqui extraído pra hook reutilizável) — mantém a tela ligada enquanto a
// pessoa está com a vela em tela cheia fazendo uma oração.
interface WakeLock {
  request(type: "screen"): Promise<WakeLockSentinel>
}

interface WakeLockSentinel {
  release(): Promise<void>
  released: boolean
  type: "screen"
}

declare global {
  interface Navigator {
    wakeLock?: WakeLock
  }
}

export function useWakeLock() {
  const sentinelRef = useRef<WakeLockSentinel | null>(null)

  const request = useCallback(async () => {
    if (!("wakeLock" in navigator)) return
    try {
      sentinelRef.current = await navigator.wakeLock!.request("screen")
    } catch (err) {
      console.warn("Não foi possível ativar o Wake Lock:", err)
    }
  }, [])

  const release = useCallback(async () => {
    if (sentinelRef.current && !sentinelRef.current.released) {
      try {
        await sentinelRef.current.release()
      } catch (err) {
        console.warn("Erro ao liberar Wake Lock:", err)
      }
    }
    sentinelRef.current = null
  }, [])

  return { request, release }
}
