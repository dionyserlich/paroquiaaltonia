"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getBanners } from "@/lib/api"

type Banner = {
  id: number
  titulo?: string | null
  link?: string | null
  imagem?: { url?: string | null; alt?: string | null } | null
}

const AUTOPLAY_MS = 5000
const SWIPE_THRESHOLD_PX = 50
// Tolerância pra diferenciar "clicou" de "arrastou" (usada só pra decidir
// se bloqueia a navegação do link, não pra avançar o slide — isso é o
// SWIPE_THRESHOLD_PX acima). Era 5px e cliques legítimos no desktop
// estavam sendo tratados como arraste — mouse/trackpad naturalmente têm
// mais tremor de pixel entre pressionar e soltar do que um toque de dedo.
const CLICK_TOLERANCE_PX = 10

export default function BannerSlider() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const draggedRef = useRef(false)
  const pointerStartXRef = useRef(0)
  const transitionLockRef = useRef(false)

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

  const goTo = (index: number) => {
    const total = banners.length
    setCurrentIndex(((index % total) + total) % total)
  }

  const goToPrevious = () => {
    if (transitionLockRef.current) return
    transitionLockRef.current = true
    goTo(currentIndex - 1)
    setTimeout(() => (transitionLockRef.current = false), 300)
  }

  const goToNext = () => {
    if (transitionLockRef.current) return
    transitionLockRef.current = true
    goTo(currentIndex + 1)
    setTimeout(() => (transitionLockRef.current = false), 300)
  }

  // Autoplay — pausa enquanto o dedo/mouse está interagindo com o carrossel.
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (banners.length > 1 && !isPaused) {
      intervalRef.current = setInterval(goToNext, AUTOPLAY_MS)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banners.length, isPaused, currentIndex])

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (banners.length <= 1) return
    pointerStartXRef.current = e.clientX
    draggedRef.current = false
    setIsDragging(true)
    setIsPaused(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging) return
    const delta = e.clientX - pointerStartXRef.current
    if (Math.abs(delta) > CLICK_TOLERANCE_PX) draggedRef.current = true
    setDragOffset(delta)
  }

  function endDrag() {
    if (!isDragging) return
    setIsDragging(false)
    if (dragOffset <= -SWIPE_THRESHOLD_PX) {
      goTo(currentIndex + 1)
    } else if (dragOffset >= SWIPE_THRESHOLD_PX) {
      goTo(currentIndex - 1)
    } else if (!draggedRef.current && Math.abs(dragOffset) < CLICK_TOLERANCE_PX) {
      // Nem arrasto nem swipe — foi um clique/toque no banner atual.
      // Navega daqui em vez de depender do <a> disparar seu próprio
      // "click": com setPointerCapture ativo (necessário pro arrasto
      // funcionar), navegadores não são consistentes sobre se o evento
      // "click" nativo chega até um <a> descendente do elemento que
      // capturou o ponteiro — no desktop isso estava silenciosamente
      // deixando de navegar. Fazer o próprio endDrag decidir, usando o
      // deslocamento real que já temos, tira essa incerteza da jogada.
      const link = banners[currentIndex]?.link
      if (link) window.location.href = link
    }
    setDragOffset(0)
    setIsPaused(false)
  }

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
      {/* touch-action: pan-y libera rolagem vertical da página, mas deixa o
          gesto horizontal livre pro carrossel — sem isso, arrastar o dedo
          pro lado no celular tenta rolar a página junto. */}
      <div
        className="relative w-full h-full flex cursor-grab active:cursor-grabbing touch-pan-y select-none"
        style={{
          transform: `translateX(calc(${-currentIndex * 100}% + ${dragOffset}px))`,
          transition: isDragging ? "none" : "transform 300ms ease-out",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={() => isDragging && endDrag()}
      >
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
              <a
                href={banner.link}
                className="absolute inset-0 z-10"
                aria-label={`Link do banner ${index + 1}`}
                // A navegação de verdade acontece em endDrag() (ver
                // comentário lá) — aqui só previne o clique simples nativo
                // do <a>, pra não navegar duas vezes nos casos em que ele
                // também chega a disparar. Preserva ctrl/cmd/shift+clique
                // (abrir em nova aba/janela), que o navegador já trata
                // nativamente sem precisar da nossa lógica de
                // clique-vs-arrasto — e clique do meio nem passa por aqui
                // (dispara "auxclick", não "click").
                onClick={(e) => {
                  if (e.ctrlKey || e.metaKey || e.shiftKey) return
                  e.preventDefault()
                }}
              />
            )}
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <>
          {/* Sempre visíveis — opacity-0/group-hover não funciona em touch,
              que é a maioria do público deste site. */}
          <button
            onClick={goToPrevious}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full z-20 transition-all duration-200"
            aria-label="Banner anterior"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={goToNext}
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
                onClick={() => goTo(index)}
                aria-label={`Ir para o banner ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex ? "w-5 bg-white" : "w-2 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
