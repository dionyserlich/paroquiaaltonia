"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getBanners } from "@/lib/api"

type Banner = {
  id: number
  titulo?: string | null
  link?: string | null
  imagem?: { url?: string | null; alt?: string | null } | null
}

const AUTOPLAY_MS = 5000

export default function BannerSlider() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Embla cuida de arraste vs. clique vs. rolagem vertical da página de
  // forma nativa e testada (é a mesma base que o carousel do shadcn/ui usa)
  // — nada de rastrear pointer events na mão. axis: "x" deixa o gesto
  // vertical livre pra rolar a página em vez de ser capturado pelo carrossel.
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, axis: "x" }, [
    Autoplay({ delay: AUTOPLAY_MS, stopOnInteraction: false, stopOnMouseEnter: true }),
  ])

  useEffect(() => {
    async function loadBanners() {
      try {
        const bannersData = await getBanners()
        setBanners(Array.isArray(bannersData) ? bannersData : [])
      } finally {
        setIsLoading(false)
      }
    }

    loadBanners()
  }, [])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    // onSelect roda a partir do próprio evento "init" do Embla (que já
    // dispara na inicialização), não chamado direto aqui no corpo do
    // effect — evita setState síncrono dentro do effect.
    emblaApi.on("init", onSelect)
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
    return () => {
      emblaApi.off("init", onSelect)
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi, onSelect])

  if (isLoading) {
    return <div className="h-48 bg-gray-700/50 rounded-xl animate-pulse" />
  }

  // Nenhum banner cadastrado (ou a busca falhou) — some de vez, sem deixar
  // um espaço de "carregando" preso pra sempre nem uma mensagem de erro
  // pra um elemento puramente promocional.
  if (banners.length === 0) {
    return null
  }

  return (
    <div className="relative w-full aspect-[18/9] rounded-xl overflow-hidden bg-gray-200">
      <div className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
        <div className="flex w-full h-full">
          {banners.map((banner, index) => (
            <div key={banner.id} className="relative w-full h-full shrink-0 grow-0 basis-full">
              <Image
                src={banner.imagem?.url || "/placeholder.svg?height=192&width=400"}
                alt={banner.imagem?.alt || banner.titulo || "Banner"}
                fill
                draggable={false}
                className="object-cover pointer-events-none"
                priority={index === 0}
                sizes="(max-width: 650px) 100vw, 650px"
              />
              {banner.link && (
                // Sem onClick próprio: desde a v7.0.8 o Embla já cancela
                // nativamente o clique quando o gesto foi um arraste de
                // verdade (evt.preventDefault()+stopPropagation() no
                // DragHandler interno) — cliques/toques reais navegam sem
                // nenhuma lógica extra da nossa parte.
                <a href={banner.link} className="absolute inset-0 z-10" aria-label={`Link do banner ${index + 1}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {banners.length > 1 && (
        <>
          {/* Sempre visíveis — opacity-0/group-hover não funciona em touch,
              que é a maioria do público deste site. */}
          <button
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full z-20 transition-all duration-200"
            aria-label="Banner anterior"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full z-20 transition-all duration-200"
            aria-label="Próximo banner"
          >
            <ChevronRight size={20} />
          </button>

          {/* Indicadores de posição — mostram quantos banners existem e qual
              está ativo, dá pra pular direto pra um específico também. */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                onClick={() => emblaApi?.scrollTo(index)}
                aria-label={`Ir para o banner ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-200 ${
                  index === selectedIndex ? "w-5 bg-white" : "w-2 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
