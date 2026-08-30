"use client"

import { useInViewport } from "@/hooks/use-in-viewport"

type Props = {
  lit: boolean
  size?: "small" | "large"
  className?: string
}

// Visual da vela (apagada/acesa), adaptado do CSS real de
// https://codepen.io/kh-mamun/pen/YLGjvx — ver o bloco .vela-* em
// app/(frontend)/globals.css pro CSS em si. .vela-candle/.vela-thread
// ficam sempre visíveis; .vela-flame/.vela-glow/.vela-blinking-glow só
// existem quando lit=true. A animação da chama só roda quando o
// componente está visível na tela (useInViewport) — importante em
// celulares mais fracos quando a listagem tem várias velas ao mesmo tempo.
export default function CandleFlame({ lit, size = "small", className }: Props) {
  const { ref, isInView } = useInViewport<HTMLDivElement>()
  const scale = size === "large" ? 0.6 : 0.28
  const paused = !isInView

  return (
    <div
      ref={ref}
      className={`vela-holder ${className ?? ""}`}
      style={{ "--vela-scale": scale } as React.CSSProperties}
    >
      <div className="vela-candle" />
      <div className="vela-thread" />
      {lit && (
        <>
          <div className={`vela-blinking-glow ${paused ? "vela-paused" : ""}`} />
          <div className="vela-glow" />
          <div className={`vela-flame ${paused ? "vela-paused" : ""}`} />
        </>
      )}
    </div>
  )
}
