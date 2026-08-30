"use client"

import { useEffect, useRef, useState } from "react"
import { Maximize2, Minimize2, X } from "lucide-react"
import type { LiveMassVideo, PlayerSize } from "./live-mass-player-provider"

const SMALL_WIDTH = 208
const SMALL_HEIGHT = 117 // 16:9
// Espaço reservado embaixo pra não sobrepor a barra de navegação fixa
// (components/bottom-navbar.tsx) — ela reserva 70px no body (globals.css),
// um pouco mais aqui de folga.
const BOTTOM_MARGIN = 96
const EDGE_MARGIN = 8

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

type Props = {
  video: LiveMassVideo | null
  size: PlayerSize
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
}

type DragState = { startX: number; startY: number; posX: number; posY: number; moved: boolean }

export default function FloatingLiveMassPlayer({ video, size, onClose, onMinimize, onMaximize }: Props) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const dragStateRef = useRef<DragState | null>(null)

  // Posição inicial do modo pequeno — só calculada na primeira vez que
  // minimiza; depois disso, mantém onde a pessoa arrastou (inclusive entre
  // fechar e abrir de novo, já que este componente nunca desmonta).
  useEffect(() => {
    if (size === "small" && pos === null) {
      setPos({
        x: clamp(window.innerWidth - SMALL_WIDTH - 16, EDGE_MARGIN, window.innerWidth - SMALL_WIDTH - EDGE_MARGIN),
        y: window.innerHeight - SMALL_HEIGHT - BOTTOM_MARGIN,
      })
    }
  }, [size, pos])

  // Trava o scroll da página só no modo grande (mesmo padrão já usado pelo
  // menu lateral em bottom-navbar.tsx) — no modo pequeno a pessoa continua
  // navegando o resto do app normalmente, é o objetivo do PiP.
  useEffect(() => {
    if (video && size === "big") {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = ""
      }
    }
  }, [video, size])

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!pos) return
    // Evita o clique fantasma que o navegador dispara depois de um toque:
    // um toque parado (sem arrastar) chama onMaximize() no pointerup, que
    // troca o player pequeno pelo fundo escuro do modo grande NA MESMA
    // posição da tela — sem isso, o "click" sintético que o navegador
    // dispara em seguida (parte da compatibilidade touch→mouse) acerta
    // esse fundo (que tem onClick={onClose}) em vez de nada, fechando o
    // player que acabou de abrir.
    e.preventDefault()
    dragStateRef.current = { startX: e.clientX, startY: e.clientY, posX: pos.x, posY: pos.y, moved: false }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const drag = dragStateRef.current
    if (!drag) return
    const dx = e.clientX - drag.startX
    const dy = e.clientY - drag.startY
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) drag.moved = true
    setPos({
      x: clamp(drag.posX + dx, EDGE_MARGIN, window.innerWidth - SMALL_WIDTH - EDGE_MARGIN),
      y: clamp(drag.posY + dy, EDGE_MARGIN, window.innerHeight - SMALL_HEIGHT - EDGE_MARGIN),
    })
  }

  function handlePointerUp() {
    const drag = dragStateRef.current
    dragStateRef.current = null
    // Tocar sem arrastar (o gesto não passou do limiar) reabre grande —
    // além do botão dedicado, é o gesto mais natural pra quem já usa PiP
    // de outros apps de vídeo.
    if (drag && !drag.moved) onMaximize()
  }

  if (!video) return null

  const isSmall = size === "small"

  return (
    <>
      {!isSmall && <div className="fixed inset-0 bg-black/70 z-[70]" onClick={onClose} />}

      <div
        className={
          isSmall
            ? "fixed z-[70]"
            : "fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
        }
        style={isSmall && pos ? { left: pos.x, top: pos.y, width: SMALL_WIDTH, height: SMALL_HEIGHT } : undefined}
      >
        <div
          className={
            isSmall
              ? "relative w-full h-full bg-black rounded-lg overflow-hidden shadow-2xl"
              : "relative w-full max-w-3xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl pointer-events-auto"
          }
        >
          <iframe src={video.linkEmbed} title={video.titulo} className="w-full h-full" allowFullScreen />

          {isSmall && (
            // Cobre o iframe inteiro pra capturar o arraste — sem isso, o
            // dedo/mouse "entra" no iframe (outra origem) e a página não
            // recebe mais os eventos de pointermove.
            <div
              className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            />
          )}

          <div className="absolute top-1.5 right-1.5 z-10 flex gap-1.5">
            {isSmall ? (
              <>
                <PlayerIconButton onClick={onMaximize} label="Aumentar player">
                  <Maximize2 size={14} />
                </PlayerIconButton>
                <PlayerIconButton onClick={onClose} label="Fechar">
                  <X size={14} />
                </PlayerIconButton>
              </>
            ) : (
              <>
                <PlayerIconButton onClick={onMinimize} label="Diminuir player">
                  <Minimize2 size={18} />
                </PlayerIconButton>
                <PlayerIconButton onClick={onClose} label="Fechar">
                  <X size={18} />
                </PlayerIconButton>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function PlayerIconButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full transition-colors"
    >
      {children}
    </button>
  )
}
