"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import "@/app/admin/admin.css"

export default function EditarMissa({ params }: { params: { id: string } }) {
  const isNew = params.id === "nova"
  const router = useRouter()
  const [formData, setFormData] = useState({
    id: 0,
    titulo: "",
    inicio: "",
    fim: "",
    linkEmbed: "",
    descricao: "",
  })
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isNew) return

    async function loadMissa() {
      try {
        const res = await fetch(`/api/missas/${params.id}`)
        if (!res.ok) throw new Error("Falha ao carregar missa")

        const data = await res.json()

        // Formatar datas para o formato do input datetime-local
        const inicio = new Date(data.inicio)
        const fim = new Date(data.fim)

        setFormData({
          ...data,
          inicio: formatDateForInput(inicio),
          fim: formatDateForInput(fim),
        })
      } catch (err) {
        setError("Erro ao carregar dados da missa")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadMissa()
  }, [isNew, params.id])

  function formatDateForInput(date: Date) {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      // Converter datas de volta para ISO string
      const dataToSend = {
        ...formData,
        inicio: new Date(formData.inicio).toISOString(),
        fim: new Date(formData.fim).toISOString(),
      }

      const url = isNew ? "/api/admin/missas" : `/api/admin/missas/${params.id}`
      const method = isNew ? "POST" : "PUT"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      })

      if (res.ok) {
        router.push("/admin/missas")
      } else {
        const data = await res.json()
        setError(data.error || "Erro ao salvar missa")
      }
    } catch (err) {
      setError("Erro ao salvar missa")
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="admin-page p-4">Carregando...</div>

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">{isNew ? "Nova Missa" : "Editar Missa"}</h1>
          <Link href="/admin/missas" className="admin-btn admin-btn-primary">
            Voltar
          </Link>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {error && <div className="admin-alert admin-alert-error">{error}</div>}

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
              />
            </div>

            <div className="mb-4">
              <label htmlFor="inicio" className="admin-label">
                Data e Hora de Início
              </label>
              <input
                type="datetime-local"
                id="inicio"
                name="inicio"
                value={formData.inicio}
                onChange={handleChange}
                className="admin-input"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="fim" className="admin-label">
                Data e Hora de Fim
              </label>
              <input
                type="datetime-local"
                id="fim"
                name="fim"
                value={formData.fim}
                onChange={handleChange}
                className="admin-input"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="linkEmbed" className="admin-label">
                Link de Incorporação (YouTube)
              </label>
              <input
                type="text"
                id="linkEmbed"
                name="linkEmbed"
                value={formData.linkEmbed}
                onChange={handleChange}
                className="admin-input"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="descricao" className="admin-label">
                Descrição
              </label>
              <textarea
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                className="admin-input"
                rows={4}
              />
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="admin-btn admin-btn-success disabled:opacity-50">
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
