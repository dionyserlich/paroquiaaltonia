"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getBanners } from "@/lib/api"

export default function BannerSlider() {
  const [banners, setBanners] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    async function loadBanners() {
      const bannersData = await getBanners()
      setBanners(bannersData)
    }

    loadBanners()
  }, [])

  useEffect(() => {
    if (banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [banners.length])

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? banners.length - 1 : prevIndex - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length)
  }

  if (banners.length === 0) {
    return <div className="h-48 bg-gray-700/50 rounded-xl animate-pulse" />
  }

  return (
    <div className="relative w-full h-48 rounded-xl overflow-hidden">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={banner.imagem || "/placeholder.svg?height=128&width=400"}
            alt={banner.titulo || "Banner"}
            fill
            className="object-cover"
          />
          {banner.link && (
            <a href={banner.link} className="absolute inset-0 z-10" aria-label={banner.titulo || "Banner"} />
          )}
        </div>
      ))}

      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-1 rounded-full z-20"
            aria-label="Anterior"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-1 rounded-full z-20"
            aria-label="Próximo"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
    </div>
  )
}
