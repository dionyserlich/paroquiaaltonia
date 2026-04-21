"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import "@/app/admin/admin.css"

type Intencao = {
  id: number
  nome: string
  email: string | null
  telefone: string | null
  tipo: string
  intencao: string
  data_preferida: string | null
  status: "pendente" | "atendida" | "arquivada"
  created_at: string
}

const STATUS_LABEL: Record<Intencao["status"], string> = {
  pendente: "Pendente",
  atendida: "Atendida",
  arquivada: "Arquivada",
}

export default function AdminIntencoesPage() {
  const [items, setItems] = useState<Intencao[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("")
  const [error, setError] = useState("")
  const [busyId, setBusyId] = useState<number | null>(null)

  async function load() {
    setLoading(true)
    setError("")
    try {
      const url = filter ? `/api/admin/intencoes?status=${filter}` : "/api/admin/intencoes"
      const res = await fetch(url, { cache: "no-store" })
      if (res.status === 401) {
        window.location.href = "/admin/login"
        return
      }
      if (!res.ok) throw new Error("Falha ao carregar")
      const data = await res.json()
      setItems(data.intencoes ?? [])
    } catch (e: any) {
      setError(e?.message || "Erro ao carregar intenções")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  async function updateStatus(id: number, status: Intencao["status"]) {
    setBusyId(id)
    try {
      const res = await fetch("/api/admin/intencoes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      })
      if (!res.ok) throw new Error("Falha ao atualizar")
      await load()
    } catch (e: any) {
      alert(e?.message || "Erro")
    } finally {
      setBusyId(null)
    }
  }

  async function remove(id: number) {
    if (!confirm("Excluir esta intenção definitivamente?")) return
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/intencoes?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Falha ao excluir")
      await load()
    } catch (e: any) {
      alert(e?.message || "Erro")
    } finally {
      setBusyId(null)
    }
  }

  function fmtDate(iso: string) {
    try {
      return new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
    } catch {
      return iso
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Intenções de Missa</h1>
          <Link href="/admin" className="admin-btn">Voltar</Link>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <label className="text-sm font-medium">Filtrar status:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="">Todas</option>
            <option value="pendente">Pendentes</option>
            <option value="atendida">Atendidas</option>
            <option value="arquivada">Arquivadas</option>
          </select>
          <button onClick={load} className="admin-btn">Atualizar</button>
          <span className="text-sm text-gray-600 ml-auto">{items.length} registro(s)</span>
        </div>

        {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}

        {loading ? (
          <p>Carregando...</p>
        ) : items.length === 0 ? (
          <p className="text-gray-600">Nenhuma intenção encontrada.</p>
        ) : (
          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.id} className="admin-card">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{it.nome}</h3>
                    <p className="text-sm text-gray-500">
                      {fmtDate(it.created_at)} · <span className="font-medium">{it.tipo}</span>
                    </p>
                  </div>
                  <span
                    className={
                      "text-xs font-semibold px-2 py-1 rounded " +
                      (it.status === "pendente"
                        ? "bg-yellow-100 text-yellow-800"
                        : it.status === "atendida"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-200 text-gray-700")
                    }
                  >
                    {STATUS_LABEL[it.status]}
                  </span>
                </div>

                <p className="text-gray-800 whitespace-pre-wrap mb-2">{it.intencao}</p>

                <div className="text-sm text-gray-600 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mb-3">
                  {it.email && (
                    <div>
                      <strong>Email:</strong>{" "}
                      <a className="text-blue-700 underline" href={`mailto:${it.email}`}>
                        {it.email}
                      </a>
                    </div>
                  )}
                  {it.telefone && (
                    <div>
                      <strong>Telefone:</strong> {it.telefone}
                    </div>
                  )}
                  {it.data_preferida && (
                    <div>
                      <strong>Data preferida:</strong> {it.data_preferida}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {it.status !== "atendida" && (
                    <button
                      disabled={busyId === it.id}
                      onClick={() => updateStatus(it.id, "atendida")}
                      className="admin-btn admin-btn-primary"
                    >
                      Marcar como atendida
                    </button>
                  )}
                  {it.status !== "pendente" && (
                    <button
                      disabled={busyId === it.id}
                      onClick={() => updateStatus(it.id, "pendente")}
                      className="admin-btn"
                    >
                      Voltar para pendente
                    </button>
                  )}
                  {it.status !== "arquivada" && (
                    <button
                      disabled={busyId === it.id}
                      onClick={() => updateStatus(it.id, "arquivada")}
                      className="admin-btn"
                    >
                      Arquivar
                    </button>
                  )}
                  <button
                    disabled={busyId === it.id}
                    onClick={() => remove(it.id)}
                    className="admin-btn admin-btn-danger ml-auto"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
