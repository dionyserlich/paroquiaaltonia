"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import "@/app/admin/admin.css"

export default function AdminNoticias() {
  const router = useRouter()
  const [noticias, setNoticias] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    loadNoticias()
  }, [])

  async function loadNoticias() {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/noticias")
      if (!res.ok) {
        throw new Error(`Erro ao carregar notícias: ${res.status}`)
      }
      const data = await res.json()
      setNoticias(data)
      setError(null)
    } catch (err: any) {
      console.error("Erro ao carregar notícias:", err)
      setError(err.message || "Erro ao carregar notícias")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/noticias/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error(`Erro ao excluir notícia: ${res.status}`)
      }

      await loadNoticias()
      setDeleteId(null)
    } catch (err: any) {
      console.error("Erro ao excluir notícia:", err)
      alert(err.message || "Erro ao excluir notícia")
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/admin" className="mr-4">
              ← Voltar
            </Link>
            <h1 className="text-xl font-bold">Gerenciar Notícias</h1>
          </div>
          <Link href="/admin/noticias/nova" className="admin-btn admin-btn-primary">
            Nova Notícia
          </Link>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {error && (
          <div className="admin-alert admin-alert-danger mb-4">
            <p>{error}</p>
            <button onClick={loadNoticias} className="underline ml-2">
              Tentar novamente
            </button>
          </div>
        )}

        {loading ? (
          <div className="admin-loading">Carregando notícias...</div>
        ) : noticias.length === 0 ? (
          <div className="admin-alert admin-alert-info">
            <p>Nenhuma notícia cadastrada.</p>
            <Link href="/admin/noticias/nova" className="underline ml-2">
              Criar nova notícia
            </Link>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>Imagem</th>
                  <th>Título</th>
                  <th style={{ width: "120px" }}>Data</th>
                  <th style={{ width: "100px" }}>Destaque</th>
                  <th style={{ width: "150px" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {noticias.map((noticia) => (
                  <tr key={noticia.id}>
                    <td>
                      <div className="relative w-12 h-12 rounded overflow-hidden">
                        <Image
                          src={noticia.imagem || "/placeholder.svg?height=48&width=48"}
                          alt={noticia.titulo}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td>{noticia.titulo}</td>
                    <td>{formatDate(noticia.data)}</td>
                    <td>{noticia.destaque ? "Sim" : "Não"}</td>
                    <td>
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin/noticias/${noticia.id}`}
                          className="admin-btn admin-btn-sm admin-btn-secondary"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => setDeleteId(noticia.id)}
                          className="admin-btn admin-btn-sm admin-btn-danger"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {deleteId && (
          <div className="admin-modal">
            <div className="admin-modal-content">
              <h2 className="text-xl font-bold mb-4">Confirmar exclusão</h2>
              <p className="mb-4">Tem certeza que deseja excluir esta notícia?</p>
              <div className="flex justify-end space-x-2">
                <button onClick={() => setDeleteId(null)} className="admin-btn admin-btn-secondary">
                  Cancelar
                </button>
                <button onClick={() => handleDelete(deleteId)} className="admin-btn admin-btn-danger">
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
