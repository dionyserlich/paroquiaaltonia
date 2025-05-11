"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AdminEventos() {
  const [eventos, setEventos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    async function loadEventos() {
      try {
        const res = await fetch("/api/proximos-eventos")
        if (!res.ok) throw new Error("Falha ao carregar eventos")
        const data = await res.json()
        setEventos(data)
      } catch (err) {
        setError("Erro ao carregar eventos")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadEventos()
  }, [])

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja excluir este evento?")) return

    try {
      const res = await fetch(`/api/admin/eventos/${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setEventos(eventos.filter((evento) => evento.id !== id))
      } else {
        setError("Erro ao excluir evento")
      }
    } catch (err) {
      setError("Erro ao excluir evento")
      console.error(err)
    }
  }

  if (loading) return <div className="p-4">Carregando...</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-[#0a1e42] text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Gerenciar Eventos</h1>
          <Link href="/admin" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Voltar
          </Link>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <div className="flex justify-end mb-4">
          <Link href="/admin/eventos/novo" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
            Novo Evento
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {eventos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Nenhum evento cadastrado
                  </td>
                </tr>
              ) : (
                eventos.map((evento) => (
                  <tr key={evento.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{evento.titulo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {evento.dia} de {evento.mes} de {evento.ano}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{evento.hora}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/eventos/${evento.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                        Editar
                      </Link>
                      <button onClick={() => handleDelete(evento.id)} className="text-red-600 hover:text-red-900">
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
