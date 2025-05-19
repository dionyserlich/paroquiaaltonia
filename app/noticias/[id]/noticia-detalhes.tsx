"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { getNoticia } from "@/lib/api"
import { formatarData } from "@/lib/utils"

export default function NoticiaDetalhes({ id }: { id: string }) {
  const [noticia, setNoticia] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadNoticia() {
      try {
        setLoading(true)
        const noticiaData = await getNoticia(id)
        setNoticia(noticiaData)
      } catch (error) {
        console.error(`Erro ao carregar notícia ${id}:`, error)
        setError("Não foi possível carregar a notícia")
      } finally {
        setLoading(false)
      }
    }

    loadNoticia()
  }, [id])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded-lg mb-6 animate-pulse"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (error || !noticia) {
    return (
      <div className="max-w-3xl mx-auto bg-gray-100 p-6 rounded-lg text-center">
        <p className="text-gray-600 mb-4">{error || "Notícia não encontrada"}</p>
        <Link href="/noticias" className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Voltar para notícias
        </Link>
      </div>
    )
  }

  return (
    <article className="max-w-3xl mx-auto">
      <Link href="/noticias" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        Voltar para notícias
      </Link>

      <h1 className="text-3xl font-bold mb-2">{noticia.titulo}</h1>
      <p className="text-yellow-500 mb-6">{formatarData(noticia.data)}</p>

      {noticia.imagem && (
        <div className="relative w-full h-64 md:h-96 mb-6 rounded-lg overflow-hidden">
          <Image src={noticia.imagem || "/placeholder.svg"} alt={noticia.titulo} fill className="object-cover" />
        </div>
      )}

      <div className="prose max-w-none text-white" dangerouslySetInnerHTML={{ __html: noticia.conteudo }} />
    </article>
  )
}
