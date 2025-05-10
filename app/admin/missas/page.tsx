"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

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

  if (loading) return <div className="p-4">Carregando...</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-[#0a1e42] text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Gerenciar Missas</h1>
          <Link href="/admin" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Voltar
          </Link>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <div className="flex justify-end mb-4">
          <Link href="/admin/missas/nova" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
            Nova Missa
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Início
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fim</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {missas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Nenhuma missa cadastrada
                  </td>
                </tr>
              ) : (
                missas.map((missa) => (
                  <tr key={missa.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{missa.titulo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(missa.inicio).toLocaleString("pt-BR")}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(missa.fim).toLocaleString("pt-BR")}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/missas/${missa.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                        Editar
                      </Link>
                      <button onClick={() => handleDelete(missa.id)} className="text-red-600 hover:text-red-900">
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
