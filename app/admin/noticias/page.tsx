"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Edit, Trash2, Plus, Search } from "lucide-react"
import { formatarData } from "@/lib/utils"

interface Noticia {
  id: string
  titulo: string
  resumo: string
  imagem: string
  data: string
  destaque: boolean
}

export default function AdminNoticias() {
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    carregarNoticias()
  }, [])

  async function carregarNoticias() {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch("/api/admin/noticias")

      if (!res.ok) {
        throw new Error("Falha ao carregar notícias")
      }

      const data = await res.json()
      setNoticias(data)
    } catch (error) {
      console.error("Erro ao carregar notícias:", error)
      setError("Erro ao carregar notícias. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  async function excluirNoticia(id: string) {
    try {
      const res = await fetch(`/api/admin/noticias/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Falha ao excluir notícia")
      }

      // Atualizar lista
      setNoticias(noticias.filter((noticia) => noticia.id !== id))
      setShowConfirmDelete(null)
    } catch (error) {
      console.error("Erro ao excluir notícia:", error)
      alert("Erro ao excluir notícia. Tente novamente.")
    }
  }

  const noticiasFiltradas = noticias.filter(
    (noticia) =>
      noticia.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      noticia.resumo.toLowerCase().includes(busca.toLowerCase()),
  )

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Gerenciar Notícias</h1>
          <Link href="/admin" className="admin-btn admin-btn-secondary">
            Voltar
          </Link>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {error && (
          <div className="admin-alert admin-alert-danger mb-4">
            <p>{error}</p>
            <button onClick={carregarNoticias} className="underline ml-2">
              Tentar novamente
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full md:w-auto">
            <input
              type="text"
              placeholder="Buscar notícias..."
              className="admin-input pl-10 w-full md:w-80"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
          <Link href="/admin/noticias/nova" className="admin-btn admin-btn-primary w-full md:w-auto">
            <Plus className="h-5 w-5 mr-2" />
            Nova Notícia
          </Link>
        </div>

        {loading ? (
          <div className="admin-card">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : noticiasFiltradas.length === 0 ? (
          <div className="admin-card text-center py-12">
            <p className="text-xl text-gray-600 mb-4">
              {busca ? "Nenhuma notícia encontrada para esta busca." : "Nenhuma notícia cadastrada."}
            </p>
            <Link href="/admin/noticias/nova" className="admin-btn admin-btn-primary">
              <Plus className="h-5 w-5 mr-2" />
              Criar Nova Notícia
            </Link>
          </div>
        ) : (
          <div className="admin-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Imagem</th>
                    <th className="text-left py-3 px-4">Título</th>
                    <th className="text-left py-3 px-4 hidden md:table-cell">Data</th>
                    <th className="text-left py-3 px-4 hidden md:table-cell">Destaque</th>
                    <th className="text-right py-3 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {noticiasFiltradas.map((noticia) => (
                    <tr key={noticia.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="relative h-16 w-24">
                          <Image
                            src={noticia.imagem || "/placeholder.svg?height=100&width=150"}
                            alt={noticia.titulo}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{noticia.titulo}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{noticia.resumo}</div>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">{formatarData(noticia.data)}</td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        {noticia.destaque ? (
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            Destaque
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            Normal
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {showConfirmDelete === noticia.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => excluirNoticia(noticia.id)}
                              className="admin-btn admin-btn-danger admin-btn-sm"
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => setShowConfirmDelete(null)}
                              className="admin-btn admin-btn-secondary admin-btn-sm"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/noticias/${noticia.id}`}
                              className="admin-btn admin-btn-secondary admin-btn-sm"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => setShowConfirmDelete(noticia.id)}
                              className="admin-btn admin-btn-danger admin-btn-sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
