"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { getNoticias } from "@/lib/api"
import { formatarData } from "@/lib/utils"

interface Noticia {
  id: string
  titulo: string
  resumo: string
  imagem: string
  data: string
  destaque: boolean
}

export default function NoticiasLista() {
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregarNoticias() {
      try {
        const data = await getNoticias()
        setNoticias(data)
      } catch (error) {
        console.error("Erro ao carregar notícias:", error)
      } finally {
        setLoading(false)
      }
    }

    carregarNoticias()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (noticias.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">Nenhuma notícia encontrada.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {noticias.map((noticia) => (
        <Link href={`/noticias/${noticia.id}`} key={noticia.id} className="block">
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48">
              <Image
                src={noticia.imagem || "/placeholder.svg?height=300&width=400"}
                alt={noticia.titulo}
                fill
                className="object-cover"
              />
              {noticia.destaque && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                  Destaque
                </div>
              )}
            </div>
            <div className="p-4">
              <h2 className="text-xl font-bold mb-2 line-clamp-2">{noticia.titulo}</h2>
              <p className="text-gray-600 mb-3 line-clamp-3">{noticia.resumo}</p>
              <p className="text-sm text-gray-500">{formatarData(noticia.data)}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
