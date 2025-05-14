"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import RichTextEditor from "@/components/rich-text-editor"
import DeployStatus from "@/components/deploy-status"
import { useVercelDeploy } from "@/contexts/vercel-deploy-context"
import AdminLayout from "@/app/admin/admin-layout"
import "@/app/admin/admin.css"

export default function EditarEvento({ params }: { params: { id: string } }) {
  const isNew = params.id === "novo"
  const router = useRouter()
  const { setDeployId } = useVercelDeploy()
  const [formData, setFormData] = useState({
    id: 0,
    titulo: "",
    dia: "",
    mes: "",
    ano: "",
    hora: "",
    descricao: "",
    conteudo: "",
  })
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [commitSha, setCommitSha] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (isNew) return

    async function loadEvento() {
      try {
        const res = await fetch(`/api/proximos-eventos/${params.id}`)
        if (!res.ok) throw new Error("Falha ao carregar evento")

        const data = await res.json()
        setFormData({
          ...data,
          conteudo: data.conteudo || "",
        })
      } catch (err) {
        setError("Erro ao carregar dados do evento")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadEvento()
  }, [isNew, params.id])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
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
      const url = isNew ? "/api/admin/eventos" : `/api/admin/eventos/${params.id}`
      const method = isNew ? "POST" : "PUT"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const data = await res.json()

        // Se a resposta incluir informações do commit, mostrar o status do deploy
        if (data._commit && data._commit.sha) {
          setCommitSha(data._commit.sha)

          // Buscar o ID do deploy mais recente da Vercel
          try {
            const deployRes = await fetch("/api/admin/get-latest-deploy")
            if (deployRes.ok) {
              const deployData = await deployRes.json()
              if (deployData.deployId) {
                setDeployId(deployData.deployId)
              }
            }
          } catch (deployErr) {
            console.error("Erro ao buscar deploy da Vercel:", deployErr)
          }
        } else {
          // Se não houver informações do commit, redirecionar imediatamente
          router.push("/admin/eventos")
        }
      } else {
        const data = await res.json()
        setError(data.error || "Erro ao salvar evento")
        setSaving(false)
      }
    } catch (err) {
      setError("Erro ao salvar evento")
      console.error(err)
      setSaving(false)
    }
  }

  function handleDeployComplete() {
    // Quando o deploy for concluído, podemos redirecionar o usuário
    router.push("/admin/eventos")
  }

  if (loading) return <div className="admin-page p-4">Carregando...</div>

  return (
    <AdminLayout>
      <div className="admin-page">
        <header className="admin-header">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">{isNew ? "Novo Evento" : "Editar Evento"}</h1>
            <Link href="/admin/eventos" className="admin-btn admin-btn-primary">
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

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label htmlFor="dia" className="admin-label">
                    Dia
                  </label>
                  <input
                    type="text"
                    id="dia"
                    name="dia"
                    value={formData.dia}
                    onChange={handleChange}
                    className="admin-input"
                    required
                    disabled={saving}
                  />
                </div>

                <div>
                  <label htmlFor="mes" className="admin-label">
                    Mês
                  </label>
                  <select
                    id="mes"
                    name="mes"
                    value={formData.mes}
                    onChange={handleChange}
                    className="admin-input"
                    required
                    disabled={saving}
                  >
                    <option value="">Selecione...</option>
                    <option value="Janeiro">Janeiro</option>
                    <option value="Fevereiro">Fevereiro</option>
                    <option value="Março">Março</option>
                    <option value="Abril">Abril</option>
                    <option value="Maio">Maio</option>
                    <option value="Junho">Junho</option>
                    <option value="Julho">Julho</option>
                    <option value="Agosto">Agosto</option>
                    <option value="Setembro">Setembro</option>
                    <option value="Outubro">Outubro</option>
                    <option value="Novembro">Novembro</option>
                    <option value="Dezembro">Dezembro</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="ano" className="admin-label">
                    Ano
                  </label>
                  <input
                    type="text"
                    id="ano"
                    name="ano"
                    value={formData.ano}
                    onChange={handleChange}
                    className="admin-input"
                    required
                    disabled={saving}
                  />
                </div>

                <div>
                  <label htmlFor="hora" className="admin-label">
                    Hora
                  </label>
                  <input
                    type="text"
                    id="hora"
                    name="hora"
                    value={formData.hora}
                    onChange={handleChange}
                    className="admin-input"
                    required
                    placeholder="Ex: 20:30"
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="descricao" className="admin-label">
                  Descrição Curta
                </label>
                <textarea
                  id="descricao"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  className="admin-input"
                  rows={2}
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
                  placeholder="Descreva o evento em detalhes..."
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
    </AdminLayout>
  )
}
