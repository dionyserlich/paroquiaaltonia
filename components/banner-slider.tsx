"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getBanners } from "@/lib/api"

export default function BannerSlider() {
  const [banners, setBanners] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    async function loadBanners() {
      const bannersData = await getBanners()
      setBanners(bannersData)
    }

    loadBanners()
  }, [])

  // Função para limpar e reiniciar o timer
  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    if (banners.length > 1 && !isPaused) {
      intervalRef.current = setInterval(() => {
        goToNext()
      }, 5000)
    }
  }

  // Configurar timer inicial
  useEffect(() => {
    resetTimer()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [banners.length, isPaused])

  const goToPrevious = () => {
    if (isTransitioning) return

    setIsTransitioning(true)
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? banners.length - 1 : prevIndex - 1))
    resetTimer()

    setTimeout(() => setIsTransitioning(false), 300)
  }

  const goToNext = () => {
    if (isTransitioning) return

    setIsTransitioning(true)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length)
    resetTimer()

    setTimeout(() => setIsTransitioning(false), 300)
  }

  const handleMouseEnter = () => {
    setIsPaused(true)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  const handleMouseLeave = () => {
    setIsPaused(false)
    resetTimer()
  }

  if (banners.length === 0) {
    return <div className="h-48 bg-gray-700/50 rounded-xl animate-pulse" />
  }

  return (
    <div
      className="relative w-full aspect-[18/9] rounded-xl overflow-hidden bg-gray-200 group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Container dos slides */}
      <div className="relative w-full h-full">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 w-full h-full transition-transform duration-300 ease-in-out ${
              index === currentIndex ? "translate-x-0" : index < currentIndex ? "-translate-x-full" : "translate-x-full"
            }`}
          >
            <Image
              src={banner.imagem || "/placeholder.svg?height=192&width=400"}
              alt={banner.titulo || "Banner"}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="(max-width: 650px) 100vw, 650px"
            />
            {banner.link && (
              <a
                href={banner.link}
                className="absolute inset-0 z-10"
                aria-label={`Link do banner ${index + 1}`}
                onClick={(e) => {
                  if (isTransitioning) {
                    e.preventDefault()
                  }
                }}
              />
            )}
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <>
          {/* Botões de navegação - aparecem no hover */}
          <button
            onClick={goToPrevious}
            disabled={isTransitioning}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full z-20 transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50"
            aria-label="Banner anterior"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={goToNext}
            disabled={isTransitioning}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full z-20 transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50"
            aria-label="Próximo banner"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </div>
  )
}
