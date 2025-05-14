"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar } from "lucide-react"

export default function EventosLista() {
  const [eventos, setEventos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadEventos() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch("/api/proximos-eventos")

        if (!res.ok) {
          throw new Error(`Erro ao carregar eventos: ${res.status}`)
        }

        const data = await res.json()
        setEventos(data) // A API já retorna os eventos ordenados corretamente
      } catch (err: any) {
        console.error("Erro ao carregar eventos:", err)
        setError(err.message || "Não foi possível carregar os eventos")
      } finally {
        setLoading(false)
      }
    }

    loadEventos()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-700/30 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-900/20 p-6 rounded-lg text-center">
        <h2 className="text-xl text-red-400 mb-4">Erro ao carregar eventos</h2>
        <p className="text-white mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          Tentar novamente
        </button>
      </div>
    )
  }

  if (eventos.length === 0) {
    return (
      <div className="bg-[#0c2657] p-6 rounded-lg text-center">
        <h2 className="text-xl text-white mb-4">Nenhum evento programado</h2>
        <p className="text-gray-300">Não há eventos programados no momento.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {eventos.map((evento) => (
        <Link href={`/eventos/${evento.id}`} key={evento.id}>
          <div className="bg-[#0c2657] p-4 rounded-lg hover:bg-[#0d2d6a] transition-colors">
            <h2 className="text-xl font-bold text-white">{evento.titulo}</h2>
            <div className="flex items-center mt-2 text-yellow-500">
              <Calendar className="mr-2" size={16} />
              <span>
                {evento.dia} de {evento.mes} de {evento.ano} às {evento.hora}
              </span>
            </div>
            <p className="text-gray-300 mt-2">{evento.descricao}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
