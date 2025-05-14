"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import DeployStatus from "@/components/deploy-status"
import { useVercelDeploy } from "@/contexts/vercel-deploy-context"
import AdminLayout from "@/app/admin/admin-layout"
import "@/app/admin/admin.css"

export default function AdminMissas() {
  const [missas, setMissas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [commitSha, setCommitSha] = useState<string | undefined>(undefined)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const router = useRouter()
  const { setDeployId } = useVercelDeploy()

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
      setDeletingId(id)
      setCommitSha(undefined)

      const res = await fetch(`/api/admin/missas/${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        const data = await res.json()

        // Remover a missa da lista
        setMissas(missas.filter((missa) => missa.id !== id))

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
        }
      } else {
        setError("Erro ao excluir missa")
        setDeletingId(null)
      }
    } catch (err) {
      setError("Erro ao excluir missa")
      console.error(err)
      setDeletingId(null)
    }
  }

  function handleDeployComplete() {
    setCommitSha(undefined)
    setDeletingId(null)
  }

  if (loading) return <div className="admin-page p-4">Carregando...</div>

  return (
    <AdminLayout>
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

          {commitSha && <DeployStatus commitSha={commitSha} onDeployComplete={handleDeployComplete} />}

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
                        <button
                          onClick={() => handleDelete(missa.id)}
                          className="text-red-600 hover:text-red-800"
                          disabled={deletingId === missa.id}
                        >
                          {deletingId === missa.id ? "Excluindo..." : "Excluir"}
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
    </AdminLayout>
  )
}
