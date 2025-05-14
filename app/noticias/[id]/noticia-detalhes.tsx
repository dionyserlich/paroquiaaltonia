"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { getNoticia } from "@/lib/api"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function NoticiaDetalhes({ id }: { id: string }) {
  const [noticia, setNoticia] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadNoticia() {
      try {
        const noticiaData = await getNoticia(id)
        if (!noticiaData) {
          setError("Notícia não encontrada")
        } else {
          setNoticia(noticiaData)
        }
      } catch (err) {
        console.error("Erro ao carregar notícia:", err)
        setError("Erro ao carregar notícia. Tente novamente mais tarde.")
      } finally {
        setLoading(false)
      }
    }

    loadNoticia()
  }, [id])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
        <div className="h-64 bg-gray-200 rounded-lg mb-4" />
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-6" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Link href="/noticias" className="text-blue-600 hover:underline">
          Voltar para a lista de notícias
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-64 w-full">
        <Image
          src={noticia.imagem || "/placeholder.svg?height=300&width=800"}
          alt={noticia.titulo}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">{noticia.titulo}</h1>
        <p className="text-sm text-gray-500 mb-6">
          {format(new Date(noticia.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: noticia.conteudo }} />
        <div className="mt-8">
          <Link href="/noticias" className="text-blue-600 hover:underline">
            ← Voltar para a lista de notícias
          </Link>
        </div>
      </div>
    </div>
  )
}
