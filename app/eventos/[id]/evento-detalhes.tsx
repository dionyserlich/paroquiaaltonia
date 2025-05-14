"use client"

import { useState, useEffect } from "react"
import { Calendar } from "lucide-react"

export default function EventoDetalhes({ id }: { id: string }) {
  const [evento, setEvento] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadEvento() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/proximos-eventos/${id}`)

        if (!res.ok) {
          throw new Error(`Erro ao carregar evento: ${res.status}`)
        }

        const data = await res.json()
        setEvento(data)
      } catch (err: any) {
        console.error("Erro ao carregar evento:", err)
        setError(err.message || "Não foi possível carregar o evento")
      } finally {
        setLoading(false)
      }
    }

    loadEvento()
  }, [id])

  if (loading) {
    return <div className="h-64 bg-gray-700/50 rounded-lg animate-pulse" />
  }

  if (error || !evento) {
    return (
      <div className="bg-red-900/20 p-6 rounded-lg text-center">
        <h2 className="text-xl text-red-400 mb-4">Erro ao carregar evento</h2>
        <p className="text-white mb-4">{error || "Evento não encontrado"}</p>
        <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="bg-[#0c2657] rounded-lg overflow-hidden">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-4">{evento.titulo}</h1>

        <div className="flex items-center mb-6 text-yellow-500">
          <Calendar className="mr-2" size={20} />
          <span>
            {evento.dia} de {evento.mes} de {evento.ano} às {evento.hora}
          </span>
        </div>

        {evento.conteudo ? (
          <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: evento.conteudo }} />
        ) : (
          <p className="text-white">{evento.descricao}</p>
        )}
      </div>
    </div>
  )
}
