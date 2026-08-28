"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { getUltimasNoticias } from "@/lib/api"
import type { Noticia, MediaDoc } from "@/app/lib/content-types"

// A rota que alimenta esta lista busca com depth: 1, então `imagem` sempre
// vem como o objeto de mídia populado — nunca o id numérico cru.
function asMedia(imagem: Noticia["imagem"]): MediaDoc | null {
  return imagem && typeof imagem === "object" ? imagem : null
}

export default function NewsList() {
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadNoticias() {
      try {
        const noticiasData = await getUltimasNoticias()
        setNoticias(Array.isArray(noticiasData) ? noticiasData : [])
      } finally {
        setIsLoading(false)
      }
    }

    loadNoticias()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-48 bg-gray-700/50 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-32 bg-gray-700/50 rounded-lg animate-pulse" />
          <div className="h-32 bg-gray-700/50 rounded-lg animate-pulse" />
        </div>
      </div>
    )
  }

  if (noticias.length === 0) {
    return (
      <div className="bg-parish-card p-6 rounded-lg text-center">
        <p className="text-gray-300">Nenhuma notícia disponível no momento.</p>
      </div>
    )
  }

  // Primeira notícia em destaque
  const noticiaDestaque = noticias[0]
  // Outras notícias
  const outrasNoticias = noticias.slice(1, 3)

  return (
    <div className="space-y-4">
      {noticiaDestaque && (
        <Link href={`/noticias/${noticiaDestaque.slug}`} className="block">
          <div className="relative w-full h-48 rounded-lg overflow-hidden">
            <Image
              src={asMedia(noticiaDestaque.imagem)?.url || "/placeholder.svg?height=192&width=400"}
              alt={asMedia(noticiaDestaque.imagem)?.alt || noticiaDestaque.titulo}
              fill
              className="object-cover"
            />
          </div>
          <h3 className="text-white font-medium mt-2">{noticiaDestaque.titulo}</h3>
        </Link>
      )}

      {outrasNoticias.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {outrasNoticias.map((noticia) => (
            <Link href={`/noticias/${noticia.slug}`} key={noticia.id} className="block">
              <div className="relative w-full h-32 rounded-lg overflow-hidden">
                <Image
                  src={asMedia(noticia.imagem)?.url || "/placeholder.svg?height=128&width=200"}
                  alt={asMedia(noticia.imagem)?.alt || noticia.titulo}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-white text-sm font-medium mt-2">{noticia.titulo}</h3>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
