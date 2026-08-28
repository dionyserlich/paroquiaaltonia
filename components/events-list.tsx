"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getProximosEventos } from "@/lib/api"
import type { Evento } from "@/app/lib/content-types"

export default function EventsList() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadEventos() {
      try {
        setIsLoading(true)
        setError(null)
        const eventosData = await getProximosEventos()

        if (Array.isArray(eventosData)) {
          setEventos(eventosData.slice(0, 4))
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
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-yellow-500 text-parish-accent-text font-medium rounded-md text-sm"
        >
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
      {eventos.map((evento) => {
        const data = new Date(evento.startAt)
        const dia = data.toLocaleDateString("pt-BR", { day: "2-digit", timeZone: "America/Sao_Paulo" })
        const mes = data.toLocaleDateString("pt-BR", { month: "short", timeZone: "America/Sao_Paulo" }).replace(".", "")
        const hora = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" })
        return (
          <Link href={`/eventos/${evento.slug}`} key={evento.id} className="block bg-parish-card p-3 rounded-lg">
            <div className="flex items-start">
              <div className="text-yellow-500 font-bold mr-3 text-center min-w-[60px]">
                <div className="text-[16pt]">{dia}</div>
                <div className="text-xs capitalize">{mes}</div>
              </div>
              <div>
                <div className="text-white text-sm">{hora}</div>
                <div className="text-yellow-500 font-medium">{evento.titulo}</div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
