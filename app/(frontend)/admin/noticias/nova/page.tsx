"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import RichTextEditor from "@/components/rich-text-editor"
import DeployStatus from "@/components/deploy-status"
import "@/app/admin/admin.css"

export default function NovaNoticias() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    titulo: "",
    resumo: "",
    conteudo: "",
    imagem: "/placeholder.svg?height=200&width=400",
    data: new Date().toISOString().slice(0, 16), // Formato: YYYY-MM-DDThh:mm
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [commitSha, setCommitSha] = useState<string | undefined>(undefined)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleRichTextChange(content: string) {
    setFormData((prev) => ({ ...prev, conteudo: content }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    setCommitSha(undefined)

    try {
      // Converter a data do formulário para ISO string
      const formattedData = {
        ...formData,
        data: new Date(formData.data).toISOString(),
      }

      const res = await fetch("/api/admin/noticias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      })

      if (res.ok) {
        const data = await res.json()

        // Se a resposta incluir informações do commit, mostrar o status do deploy
        if (data._commit && data._commit.sha) {
          setCommitSha(data._commit.sha)
        } else {
          // Se não houver informações do commit, redirecionar imediatamente
          router.push("/admin/noticias")
        }
      } else {
        const data = await res.json()
        setError(data.error || "Erro ao salvar notícia")
        setSaving(false)
      }
    } catch (err) {
      setError("Erro ao salvar notícia")
      console.error(err)
      setSaving(false)
    }
  }

  function handleDeployComplete() {
    // Quando o deploy for concluído, podemos redirecionar o usuário
    router.push("/admin/noticias")
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Nova Notícia</h1>
          <Link href="/admin/noticias" className="admin-btn admin-btn-primary">
            Voltar
          </Link>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {error && <div className="admin-alert admin-alert-error">{error}</div>}

        {commitSha && <DeployStatus commitSha={commitSha} onDeployComplete={handleDeployComplete} />}

        <div className="admin-card">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="titulo" className="admin-label">
                Título
              </label>
              <input
                type="text"
                id="titulo"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                className="admin-input"
                required
                disabled={saving}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="resumo" className="admin-label">
                Resumo
              </label>
              <textarea
                id="resumo"
                name="resumo"
                value={formData.resumo}
                onChange={handleChange}
                className="admin-input"
                rows={3}
                required
                disabled={saving}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="imagem" className="admin-label">
                URL da Imagem
              </label>
              <input
                type="text"
                id="imagem"
                name="imagem"
                value={formData.imagem}
                onChange={handleChange}
                className="admin-input"
                disabled={saving}
              />
              <p className="text-sm text-gray-500 mt-1">
                Deixe o valor padrão para usar uma imagem de placeholder, ou insira a URL de uma imagem.
              </p>
            </div>

            <div className="mb-4">
              <label htmlFor="data" className="admin-label">
                Data e Hora
              </label>
              <input
                type="datetime-local"
                id="data"
                name="data"
                value={formData.data}
                onChange={handleChange}
                className="admin-input"
                required
                disabled={saving}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="conteudo" className="admin-label">
                Conteúdo Completo
              </label>
              <RichTextEditor
                value={formData.conteudo}
                onChange={handleRichTextChange}
                placeholder="Escreva o conteúdo da notícia..."
              />
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="admin-btn admin-btn-success disabled:opacity-50">
                {saving ? (commitSha ? "Salvando..." : "Processando...") : "Salvar"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
