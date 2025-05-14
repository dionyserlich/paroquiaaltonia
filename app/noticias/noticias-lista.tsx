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
    async function carregarNoticias() {
      try {
        setLoading(true)
        const data = await getNoticias()
        setNoticias(data)
      } catch (error) {
        console.error("Erro ao carregar notícias:", error)
        setError("Não foi possível carregar as notícias")
      } finally {
        setLoading(false)
      }
    }

    carregarNoticias()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((item) => (
          <div key={item} className="bg-gray-800 rounded-lg overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-700"></div>
            <div className="p-4">
              <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error || noticias.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-white/70">{error || "Nenhuma notícia disponível no momento."}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {noticias.map((noticia) => (
        <Link
          href={`/noticias/${noticia.id}`}
          key={noticia.id}
          className="block bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="relative h-48 md:h-64">
            <Image
              src={noticia.imagem || "/placeholder.svg?height=400&width=800"}
              alt={noticia.titulo}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-4">
            <h2 className="text-xl font-bold text-white mb-2">{noticia.titulo}</h2>
            <p className="text-gray-400 text-sm mb-3">{formatarData(noticia.data)}</p>
            <p className="text-gray-300">{noticia.resumo}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
