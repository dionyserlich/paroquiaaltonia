"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Save, Upload } from "lucide-react"
import RichTextEditor from "@/components/rich-text-editor"

interface NoticiaFormProps {
  params: {
    id: string
  }
}

export default function NoticiaForm({ params }: NoticiaFormProps) {
  const router = useRouter()
  const { id } = params
  const isNovo = id === "nova"

  const [titulo, setTitulo] = useState("")
  const [resumo, setResumo] = useState("")
  const [conteudo, setConteudo] = useState("")
  const [imagem, setImagem] = useState("")
  const [destaque, setDestaque] = useState(false)
  const [loading, setLoading] = useState(!isNovo)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [imagemPreview, setImagemPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!isNovo) {
      carregarNoticia()
    }
  }, [id, isNovo])

  async function carregarNoticia() {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/noticias/${id}`)

      if (!res.ok) {
        throw new Error("Notícia não encontrada")
      }

      const noticia = await res.json()

      setTitulo(noticia.titulo)
      setResumo(noticia.resumo)
      setConteudo(noticia.conteudo)
      setImagem(noticia.imagem)
      setDestaque(noticia.destaque)
      setImagemPreview(noticia.imagem)
    } catch (error) {
      console.error("Erro ao carregar notícia:", error)
      setErro("Erro ao carregar notícia. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!titulo || !resumo || !conteudo) {
      setErro("Preencha todos os campos obrigatórios.")
      return
    }

    try {
      setSalvando(true)

      const noticia = {
        titulo,
        resumo,
        conteudo,
        imagem,
        destaque,
      }

      const url = isNovo ? "/api/admin/noticias" : `/api/admin/noticias/${id}`
      const method = isNovo ? "POST" : "PUT"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(noticia),
      })

      if (!res.ok) {
        throw new Error("Erro ao salvar notícia")
      }

      router.push("/admin/noticias")
    } catch (error) {
      console.error("Erro ao salvar notícia:", error)
      setErro("Erro ao salvar notícia. Tente novamente.")
    } finally {
      setSalvando(false)
    }
  }

  async function handleImagemUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        throw new Error("Erro ao fazer upload da imagem")
      }

      const data = await res.json()
      setImagem(data.url)
      setImagemPreview(data.url)
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error)
      alert("Erro ao fazer upload da imagem. Tente novamente.")
    }
  }

  if (loading) {
    return (
      <div className="admin-page">
        <header className="admin-header">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">Carregando...</h1>
          </div>
        </header>
        <main className="container mx-auto p-4">
          <div className="admin-card animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">{isNovo ? "Nova Notícia" : "Editar Notícia"}</h1>
          <div className="flex gap-2">
            <Link href="/admin/noticias" className="admin-btn admin-btn-secondary">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar
            </Link>
            <button onClick={handleSubmit} disabled={salvando} className="admin-btn admin-btn-primary">
              <Save className="h-5 w-5 mr-2" />
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {erro && (
          <div className="admin-alert admin-alert-danger mb-4">
            <p>{erro}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-card">
          <div className="mb-4">
            <label htmlFor="titulo" className="admin-label">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="titulo"
              className="admin-input"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="resumo" className="admin-label">
              Resumo <span className="text-red-500">*</span>
            </label>
            <textarea
              id="resumo"
              className="admin-input"
              rows={3}
              value={resumo}
              onChange={(e) => setResumo(e.target.value)}
              required
            ></textarea>
            <p className="text-sm text-gray-500 mt-1">Breve descrição da notícia (será exibida na listagem)</p>
          </div>

          <div className="mb-4">
            <label className="admin-label">Imagem Destacada</label>
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <div className="relative h-48 w-full md:w-64 bg-gray-100 rounded overflow-hidden">
                {imagemPreview ? (
                  <Image src={imagemPreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Sem imagem</p>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <label htmlFor="imagem" className="admin-btn admin-btn-secondary cursor-pointer">
                    <Upload className="h-5 w-5 mr-2" />
                    Selecionar Imagem
                  </label>
                  <input type="file" id="imagem" className="hidden" accept="image/*" onChange={handleImagemUpload} />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Imagem que será exibida no topo da notícia e na listagem. Recomendado: 1200x630px
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600"
                checked={destaque}
                onChange={(e) => setDestaque(e.target.checked)}
              />
              <span className="ml-2">Marcar como destaque</span>
            </label>
            <p className="text-sm text-gray-500 mt-1">Notícias em destaque aparecem em primeiro lugar na listagem</p>
          </div>

          <div className="mb-4">
            <label htmlFor="conteudo" className="admin-label">
              Conteúdo <span className="text-red-500">*</span>
            </label>
            <RichTextEditor
              value={conteudo}
              onChange={setConteudo}
              placeholder="Escreva o conteúdo da notícia aqui..."
            />
          </div>
        </form>
      </main>
    </div>
  )
}
