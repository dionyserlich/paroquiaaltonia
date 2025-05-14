"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { getNoticias } from "@/lib/api"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function NoticiasLista() {
  const [noticias, setNoticias] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadNoticias() {
      try {
        const noticiasData = await getNoticias()
        setNoticias(noticiasData)
      } catch (error) {
        console.error("Erro ao carregar notícias:", error)
      } finally {
        setLoading(false)
      }
    }

    loadNoticias()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg mb-4" />
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
          </div>
        ))}
      </div>
    )
  }

  if (noticias.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500">Nenhuma notícia disponível no momento.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {noticias.map((noticia) => (
        <Link href={`/noticias/${noticia.id}`} key={noticia.id}>
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="md:flex">
              <div className="md:w-1/3 relative h-48 md:h-auto">
                <Image
                  src={noticia.imagem || "/placeholder.svg?height=200&width=300"}
                  alt={noticia.titulo}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 md:w-2/3">
                <h2 className="text-xl font-bold mb-2">{noticia.titulo}</h2>
                <p className="text-sm text-gray-500 mb-2">
                  {formatDistanceToNow(new Date(noticia.data), { addSuffix: true, locale: ptBR })}
                </p>
                <div
                  className="text-gray-600 line-clamp-3"
                  dangerouslySetInnerHTML={{
                    __html: noticia.conteudo.replace(/<[^>]*>/g, " ").substring(0, 150) + "...",
                  }}
                />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
