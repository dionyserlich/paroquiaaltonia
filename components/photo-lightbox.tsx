"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

type Foto = {
  id: number | string
  url: string
  alt?: string | null
}

export default function PhotoLightbox({ fotos, altFallback }: { fotos: Foto[]; altFallback: string }) {
  const [indiceAberto, setIndiceAberto] = useState<number | null>(null)

  const fechar = () => setIndiceAberto(null)
  const anterior = () => setIndiceAberto((i) => (i === null ? null : (i - 1 + fotos.length) % fotos.length))
  const proxima = () => setIndiceAberto((i) => (i === null ? null : (i + 1) % fotos.length))

  // Setas do teclado também navegam — não é indispensável pro público-alvo,
  // mas é reforço de graça já que o Dialog do Radix já captura o foco.
  useEffect(() => {
    if (indiceAberto === null) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") anterior()
      if (e.key === "ArrowRight") proxima()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [indiceAberto])

  const fotoAtual = indiceAberto !== null ? fotos[indiceAberto] : null

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {fotos.map((foto, idx) => (
          <button
            key={foto.id}
            type="button"
            onClick={() => setIndiceAberto(idx)}
            className="relative aspect-square rounded-lg overflow-hidden"
          >
            <Image src={foto.url} alt={foto.alt || altFallback} fill className="object-cover" />
          </button>
        ))}
      </div>

      <Dialog open={indiceAberto !== null} onOpenChange={(open) => !open && fechar()}>
        <DialogContent className="max-w-3xl w-[95vw] h-[85vh] p-0 bg-black border-0 flex items-center justify-center overflow-hidden">
          <DialogTitle className="sr-only">{fotoAtual?.alt || altFallback}</DialogTitle>
          {fotoAtual && (
            <div className="relative w-full h-full">
              <Image src={fotoAtual.url} alt={fotoAtual.alt || altFallback} fill className="object-contain" />
            </div>
          )}

          {fotos.length > 1 && (
            <>
              <button
                type="button"
                onClick={anterior}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                aria-label="Foto anterior"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={proxima}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                aria-label="Próxima foto"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
