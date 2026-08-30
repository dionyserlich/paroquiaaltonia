"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Flame, Pencil, X } from "lucide-react"
import CandleFlame from "@/components/candle-flame"
import { useWakeLock } from "@/hooks/use-wake-lock"

export type VelaExibicao = {
  id: number
  nome: string | null
  nomePrivado?: boolean
  intencao: string | null
  intencaoPrivada: boolean
  foto: string | null
  fotoPrivada?: boolean
  createdAt: string
  souDono: boolean
}

function formatarData(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
    new Date(iso)
  )
}

type Props = {
  vela: VelaExibicao
  onClose: () => void
  onEditar?: () => void
  onApagar?: () => void
}

// Tela cheia pra quem quer "ficar" com a vela acesa durante uma oração — o
// wake lock (hooks/use-wake-lock.ts) mantém a tela ligada enquanto essa
// tela estiver aberta, mesmo padrão já usado em explicacao-leitura.tsx.
export default function VelaFullscreen({ vela, onClose, onEditar, onApagar }: Props) {
  const wakeLock = useWakeLock()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    wakeLock.request()
    document.body.style.overflow = "hidden"
    return () => {
      wakeLock.release()
      document.body.style.overflow = ""
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!mounted) return null

  // Renderizado direto em document.body via portal — .page-no-hero (que
  // envolve o conteúdo desta página) tem position:relative + z-index:20 no
  // CSS, o que cria um contexto de empilhamento próprio. Qualquer z-index
  // definido AQUI DENTRO só compete com outros elementos dentro desse mesmo
  // contexto (nunca chega a superar o cabeçalho, que é z-50 mas fica FORA
  // de .page-no-hero) — não importa o quão alto o z-index declarado seja.
  // O portal escapa desse problema renderizando fora da árvore da página.
  return createPortal(
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {vela.foto && (
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={vela.foto} alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}

      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-full transition-colors"
        aria-label="Fechar"
      >
        <X size={20} />
      </button>

      <div className="relative flex-1 flex flex-col items-center justify-center px-6 text-center gap-6 overflow-y-auto py-16">
        <CandleFlame lit size="xlarge" />

        <div className="space-y-2 max-w-md">
          {vela.nome && (
            <div>
              <p className="text-sm text-gray-400">Vela de</p>
              <p className="text-2xl font-bold text-white">{vela.nome}</p>
              {vela.nomePrivado && (
                <p className="text-xs text-gray-400 italic mt-1">Só você vê esta informação.</p>
              )}
            </div>
          )}
          {vela.intencao ? (
            <div>
              <p className="text-gray-300">Intenção: {vela.intencao}</p>
              {vela.intencaoPrivada && (
                <p className="text-xs text-gray-400 italic mt-1">Só você vê esta informação.</p>
              )}
            </div>
          ) : (
            <p className="text-gray-300 italic">
              A pessoa que acendeu esta vela preferiu não divulgar a sua intenção.
            </p>
          )}
          <p className="text-xs text-gray-400">{formatarData(vela.createdAt)}</p>
        </div>

        {vela.souDono && (onEditar || onApagar) && (
          <div className="flex gap-3">
            {onEditar && (
              <button
                onClick={onEditar}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-colors"
              >
                <Pencil size={16} />
                Editar
              </button>
            )}
            {onApagar && (
              <button
                onClick={onApagar}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-colors"
              >
                <Flame size={16} />
                Apagar vela
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
