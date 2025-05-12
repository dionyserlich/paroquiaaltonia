"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import "@/app/admin/admin.css"

export default function AdminMissas() {
  const [missas, setMissas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    async function loadMissas() {
      try {
        const res = await fetch("/api/missas")
        if (!res.ok) throw new Error("Falha ao carregar missas")
        const data = await res.json()
        setMissas(data)
      } catch (err) {
        setError("Erro ao carregar missas")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadMissas()
  }, [])

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja excluir esta missa?")) return

    try {
      const res = await fetch(`/api/admin/missas/${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setMissas(missas.filter((missa) => missa.id !== id))
      } else {
        setError("Erro ao excluir missa")
      }
    } catch (err) {
      setError("Erro ao excluir missa")
      console.error(err)
    }
  }

  if (loading) return <div className="admin-page p-4">Carregando...</div>

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Gerenciar Missas</h1>
          <Link href="/admin" className="admin-btn admin-btn-primary">
            Voltar
          </Link>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {error && <div className="admin-alert admin-alert-error">{error}</div>}

        <div className="flex justify-end mb-4">
          <Link href="/admin/missas/nova" className="admin-btn admin-btn-success">
            Nova Missa
          </Link>
        </div>

        <div className="admin-card overflow-hidden">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Início</th>
                <th>Fim</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {missas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-gray-500">
                    Nenhuma missa cadastrada
                  </td>
                </tr>
              ) : (
                missas.map((missa) => (
                  <tr key={missa.id}>
                    <td>{missa.titulo}</td>
                    <td>{new Date(missa.inicio).toLocaleString("pt-BR")}</td>
                    <td>{new Date(missa.fim).toLocaleString("pt-BR")}</td>
                    <td className="text-right">
                      <Link href={`/admin/missas/${missa.id}`} className="admin-link mr-4">
                        Editar
                      </Link>
                      <button onClick={() => handleDelete(missa.id)} className="text-red-600 hover:text-red-800">
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
