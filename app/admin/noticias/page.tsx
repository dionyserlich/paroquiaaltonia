"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import DeployStatus from "@/components/deploy-status"
import "@/app/admin/admin.css"

export default function AdminNoticias() {
  const [noticias, setNoticias] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [commitSha, setCommitSha] = useState<string | undefined>(undefined)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadNoticias() {
      try {
        const res = await fetch("/api/noticias")
        if (!res.ok) throw new Error("Falha ao carregar notícias")
        const data = await res.json()

        // Ordenar notícias por data (mais recente primeiro)
        const sortedNoticias = [...data].sort((a, b) => {
          return new Date(b.data).getTime() - new Date(a.data).getTime()
        })

        setNoticias(sortedNoticias)
      } catch (err) {
        setError("Erro ao carregar notícias")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadNoticias()
  }, [])

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja excluir esta notícia?")) return

    try {
      setDeletingId(id)
      setCommitSha(undefined)

      const res = await fetch(`/api/admin/noticias/${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        const data = await res.json()

        // Remover a notícia da lista
        setNoticias(noticias.filter((noticia) => noticia.id !== id))

        // Se a resposta incluir informações do commit, mostrar o status do deploy
        if (data._commit && data._commit.sha) {
          setCommitSha(data._commit.sha)
        }
      } else {
        setError("Erro ao excluir notícia")
        setDeletingId(null)
      }
    } catch (err) {
      setError("Erro ao excluir notícia")
      console.error(err)
      setDeletingId(null)
    }
  }

  function handleDeployComplete() {
    setCommitSha(undefined)
    setDeletingId(null)
  }

  function formatarData(dataString: string) {
    try {
      const data = new Date(dataString)
      return data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return dataString
    }
  }

  if (loading) return <div className="admin-page p-4">Carregando...</div>

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Gerenciar Notícias</h1>
          <Link href="/admin" className="admin-btn admin-btn-primary">
            Voltar
          </Link>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {error && <div className="admin-alert admin-alert-error">{error}</div>}

        {commitSha && <DeployStatus commitSha={commitSha} onDeployComplete={handleDeployComplete} />}

        <div className="flex justify-end mb-4">
          <Link href="/admin/noticias/nova" className="admin-btn admin-btn-success">
            Nova Notícia
          </Link>
        </div>

        <div className="admin-card overflow-hidden">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Data</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {noticias.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center text-gray-500">
                    Nenhuma notícia cadastrada
                  </td>
                </tr>
              ) : (
                noticias.map((noticia) => (
                  <tr key={noticia.id}>
                    <td>{noticia.titulo}</td>
                    <td>{formatarData(noticia.data)}</td>
                    <td className="text-right">
                      <Link href={`/admin/noticias/${noticia.id}`} className="admin-link mr-4">
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(noticia.id)}
                        className="text-red-600 hover:text-red-800"
                        disabled={deletingId === noticia.id}
                      >
                        {deletingId === noticia.id ? "Excluindo..." : "Excluir"}
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
