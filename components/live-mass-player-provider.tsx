"use client"

import { createContext, useCallback, useContext, useState } from "react"
import FloatingLiveMassPlayer from "./floating-live-mass-player"

export type LiveMassVideo = {
  titulo: string
  linkEmbed: string
}

export type PlayerSize = "big" | "small"

type LiveMassPlayerContextValue = {
  open: (video: LiveMassVideo) => void
  close: () => void
}

const LiveMassPlayerContext = createContext<LiveMassPlayerContextValue | null>(null)

export function useLiveMassPlayer() {
  const ctx = useContext(LiveMassPlayerContext)
  if (!ctx) throw new Error("useLiveMassPlayer precisa estar dentro de LiveMassPlayerProvider")
  return ctx
}

// Montado uma única vez em app/(frontend)/layout.tsx — precisa ficar ACIMA
// de onde as páginas trocam (children), não em page-client.tsx (remontado a
// cada página). Assim o <iframe> nunca é desmontado ao navegar, e o vídeo
// continua tocando (modo "picture-in-picture" dentro do app) enquanto a
// pessoa visita outras páginas.
export function LiveMassPlayerProvider({ children }: { children: React.ReactNode }) {
  const [video, setVideo] = useState<LiveMassVideo | null>(null)
  const [size, setSize] = useState<PlayerSize>("big")

  const open = useCallback((v: LiveMassVideo) => {
    setVideo(v)
    setSize("big")
  }, [])

  const close = useCallback(() => setVideo(null), [])
  const minimize = useCallback(() => setSize("small"), [])
  const maximize = useCallback(() => setSize("big"), [])

  return (
    <LiveMassPlayerContext.Provider value={{ open, close }}>
      {children}
      <FloatingLiveMassPlayer video={video} size={size} onClose={close} onMinimize={minimize} onMaximize={maximize} />
    </LiveMassPlayerContext.Provider>
  )
}
