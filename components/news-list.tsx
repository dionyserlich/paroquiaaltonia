"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { getUltimasNoticias } from "@/lib/api"

export default function NewsList() {
  const [noticias, setNoticias] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadNoticias() {
      setIsLoading(true)
      try {
        const noticiasData = await getUltimasNoticias()
        setNoticias(noticiasData)
      } catch (error) {
        console.error("Erro ao carregar notícias:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNoticias()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-48 bg-gray-700/30 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-32 bg-gray-700/30 rounded-lg animate-pulse" />
          <div className="h-32 bg-gray-700/30 rounded-lg animate-pulse" />
        </div>
      </div>
    )
  }

  if (noticias.length === 0) {
    return (
      <div className="p-4 text-center text-white">
        <p>Nenhuma notícia disponível no momento.</p>
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
        <Link href={`/noticias/${noticiaDestaque.id}`} className="block">
          <div className="relative w-full h-48 rounded-lg overflow-hidden">
            <Image
              src={noticiaDestaque.imagem || "/placeholder.svg?height=192&width=400"}
              alt={noticiaDestaque.titulo}
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
            <Link href={`/noticias/${noticia.id}`} key={noticia.id} className="block">
              <div className="relative w-full h-32 rounded-lg overflow-hidden">
                <Image
                  src={noticia.imagem || "/placeholder.svg?height=128&width=200"}
                  alt={noticia.titulo}
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
