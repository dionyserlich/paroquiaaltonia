"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getProximosEventos } from "@/lib/api"

export default function EventsList() {
  const [eventos, setEventos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadEventos() {
      try {
        setIsLoading(true)
        setError(null)
        const eventosData = await getProximosEventos()

        // Verificar se os dados retornados são um array
        if (Array.isArray(eventosData)) {
          setEventos(eventosData.slice(0, 4)) // Limitar a 4 eventos
        } else {
          console.error("Dados de eventos inválidos:", eventosData)
          setError("Formato de dados inválido")
          setEventos([])
        }
      } catch (error) {
        console.error("Erro ao carregar eventos:", error)
        setError("Não foi possível carregar os eventos")
        setEventos([])
      } finally {
        setIsLoading(false)
      }
    }

    loadEventos()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-700/50 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-400">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-2 px-4 py-2 bg-blue-600 rounded-md text-sm">
          Tentar novamente
        </button>
      </div>
    )
  }

  if (eventos.length === 0) {
    return (
      <div className="p-4 text-center text-white">
        <p>Nenhum evento programado no momento.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {eventos.map((evento) => (
        <Link href={`/eventos/${evento.id}`} key={evento.id} className="block bg-[#0c2657] p-3 rounded-lg">
          <div className="flex items-start">
            <div className="text-yellow-500 font-bold mr-3 text-right min-w-[60px]">
              <div>{evento.dia}</div>
              <div>de {evento.mes}</div>
            </div>
            <div>
              <div className="text-white text-sm">{evento.hora}</div>
              <div className="text-yellow-500 font-medium">{evento.titulo}</div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
