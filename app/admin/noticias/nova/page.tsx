"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import RichTextEditor from "@/components/rich-text-editor"
import "@/app/admin/admin.css"

export default function NovaNoticia() {
  const router = useRouter()
  const [titulo, setTitulo] = useState("")
  const [conteudo, setConteudo] = useState("")
  const [imagem, setImagem] = useState("")
  const [data, setData] = useState(new Date().toISOString().split("T")[0])
  const [destaque, setDestaque] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setSaving(true)
      const res = await fetch("/api/admin/noticias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo,
          conteudo,
          imagem,
          data: new Date(data).toISOString(),
          destaque,
        }),
      })

      if (!res.ok) {
        throw new Error(`Erro ao criar notícia: ${res.status}`)
      }

      router.push("/admin/noticias")
    } catch (err: any) {
      console.error("Erro ao criar notícia:", err)
      setError(err.message || "Erro ao criar notícia")
      setSaving(false)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        throw new Error(`Erro ao fazer upload da imagem: ${res.status}`)
      }

      const data = await res.json()
      setImagem(data.url)
    } catch (err: any) {
      console.error("Erro ao fazer upload da imagem:", err)
      alert(err.message || "Erro ao fazer upload da imagem")
    } finally {
      setUploadingImage(false)
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/admin/noticias" className="mr-4">
              ← Voltar
            </Link>
            <h1 className="text-xl font-bold">Nova Notícia</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {error && (
          <div className="admin-alert admin-alert-danger mb-4">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-form-group">
            <label htmlFor="titulo" className="admin-form-label">
              Título
            </label>
            <input
              type="text"
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="admin-form-input"
              required
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="data" className="admin-form-label">
              Data
            </label>
            <input
              type="date"
              id="data"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="admin-form-input"
              required
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="imagem" className="admin-form-label">
              Imagem
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                id="imagem"
                value={imagem}
                onChange={(e) => setImagem(e.target.value)}
                className="admin-form-input flex-grow"
                placeholder="URL da imagem"
              />
              <div className="relative">
                <input
                  type="file"
                  id="upload"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept="image/*"
                />
                <button type="button" className="admin-btn admin-btn-secondary" disabled={uploadingImage}>
                  {uploadingImage ? "Enviando..." : "Upload"}
                </button>
              </div>
            </div>
            {imagem && (
              <div className="mt-2">
                <img src={imagem || "/placeholder.svg"} alt="Preview" className="h-32 object-cover rounded" />
              </div>
            )}
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label flex items-center">
              <input
                type="checkbox"
                checked={destaque}
                onChange={(e) => setDestaque(e.target.checked)}
                className="mr-2"
              />
              Destaque
            </label>
          </div>

          <div className="admin-form-group">
            <label htmlFor="conteudo" className="admin-form-label">
              Conteúdo
            </label>
            <RichTextEditor value={conteudo} onChange={setConteudo} />
          </div>

          <div className="admin-form-buttons">
            <Link href="/admin/noticias" className="admin-btn admin-btn-secondary">
              Cancelar
            </Link>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
