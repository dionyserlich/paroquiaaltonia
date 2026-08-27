"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { getNoticias } from "@/lib/api"
import { formatarData } from "@/lib/utils"

export default function NoticiasLista() {
  const [noticias, setNoticias] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadNoticias() {
      try {
        setLoading(true)
        const noticiasData = await getNoticias()

        // Sort news from most recent to oldest
        const sortedNoticias = noticiasData.sort((a: any, b: any) => {
          const dateA = new Date(a.data).getTime()
          const dateB = new Date(b.data).getTime()
          return dateB - dateA // Descending order (most recent first)
        })

        setNoticias(sortedNoticias)
      } catch (error) {
        console.error("Erro ao carregar notícias:", error)
        setError("Não foi possível carregar as notícias")
      } finally {
        setLoading(false)
      }
    }

    loadNoticias()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-100 p-4 rounded-lg animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error || noticias.length === 0) {
    return (
      <div className="bg-gray-100 p-6 rounded-lg text-center">
        <p className="text-gray-600">{error || "Nenhuma notícia disponível no momento."}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {noticias.map((noticia) => (
        <Link
          href={`/noticias/${noticia.id}`}
          key={noticia.id}
          className="block bg-[#0c2657] rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="md:flex">
            <div className="md:w-1/3 relative">
              <div className="aspect-w-16 aspect-h-9 md:h-full">
                <Image
                  src={noticia.imagem || "/placeholder.svg?height=200&width=300"}
                  alt={noticia.titulo}
                  width={300}
                  height={200}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
            <div className="p-4 md:w-2/3">
              <h2 className="text-xl font-semibold mb-2">{noticia.titulo}</h2>
              <p className="text-sm text-yellow-500 mb-2">{formatarData(noticia.data)}</p>
              <p className="text-gray-300 line-clamp-3">
                {noticia.resumo || "Clique para ler mais sobre esta notícia."}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
