"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Share2 } from "lucide-react"
import { getNoticia } from "@/lib/api"
import { formatarData } from "@/lib/utils"

interface NoticiaDetalhesProps {
  id: string
}

interface Noticia {
  id: string
  titulo: string
  resumo: string
  conteudo: string
  imagem: string
  data: string
}

export default function NoticiaDetalhes({ id }: NoticiaDetalhesProps) {
  const [noticia, setNoticia] = useState<Noticia | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function carregarNoticia() {
      try {
        setLoading(true)
        const data = await getNoticia(id)
        if (!data) {
          setError("Notícia não encontrada")
        } else {
          setNoticia(data)
        }
      } catch (error) {
        console.error(`Erro ao carregar notícia ${id}:`, error)
        setError("Erro ao carregar notícia")
      } finally {
        setLoading(false)
      }
    }

    carregarNoticia()
  }, [id])

  const compartilhar = async () => {
    if (!noticia) return

    const titulo = noticia.titulo
    const url = window.location.href

    try {
      if (navigator.share) {
        await navigator.share({
          title: titulo,
          text: noticia.resumo,
          url: url,
        })
      } else {
        // Fallback para navegadores que não suportam a API Web Share
        navigator.clipboard.writeText(url)
        alert("Link copiado para a área de transferência!")
      }
    } catch (error) {
      console.error("Erro ao compartilhar:", error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-3/4 mb-6"></div>
          <div className="h-64 bg-gray-700 rounded mb-6"></div>
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (error || !noticia) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Notícia não encontrada</h1>
          <p className="text-white/70 mb-6">A notícia que você está procurando não existe ou foi removida.</p>
          <Link href="/noticias" className="inline-flex items-center text-yellow-500 hover:text-yellow-400">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para todas as notícias
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/noticias" className="inline-flex items-center text-yellow-500 hover:text-yellow-400">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para todas as notícias
        </Link>
      </div>

      <article className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="relative h-64 md:h-80">
          <Image
            src={noticia.imagem || "/placeholder.svg?height=600&width=800"}
            alt={noticia.titulo}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white">{noticia.titulo}</h1>
            <button
              onClick={compartilhar}
              className="text-gray-300 hover:text-yellow-500 p-2 rounded-full hover:bg-gray-700"
              aria-label="Compartilhar notícia"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          <p className="text-gray-400 mb-6">{formatarData(noticia.data)}</p>

          <div
            className="prose prose-invert max-w-none text-gray-200"
            dangerouslySetInnerHTML={{ __html: noticia.conteudo }}
          />
        </div>
      </article>
    </div>
  )
}
