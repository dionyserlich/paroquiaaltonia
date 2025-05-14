"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Calendar, Clock, MapPin, ArrowLeft } from "lucide-react"
import Link from "next/link"
import EventoDetalhesSkeleton from "@/components/skeletons/evento-detalhes-skeleton"

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
          if (res.status === 404) {
            throw new Error("Evento não encontrado")
          }
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

    if (id) {
      loadEvento()
    }
  }, [id])

  if (loading) {
    return <EventoDetalhesSkeleton />
  }

  if (error) {
    return (
      <div className="bg-red-900/20 p-6 rounded-lg text-center">
        <h2 className="text-xl text-red-400 mb-4">Erro</h2>
        <p className="text-white mb-4">{error}</p>
        <Link href="/eventos" className="bg-blue-600 text-white px-4 py-2 rounded-lg inline-block">
          Voltar para eventos
        </Link>
      </div>
    )
  }

  if (!evento) {
    return (
      <div className="bg-[#0c2657] p-6 rounded-lg text-center">
        <h2 className="text-xl text-white mb-4">Evento não encontrado</h2>
        <Link href="/eventos" className="bg-yellow-500 text-[#4d3600] px-4 py-2 rounded-lg inline-block">
          Voltar para eventos
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link href="/eventos" className="flex items-center text-white mb-4 hover:text-yellow-500 transition-colors">
        <ArrowLeft className="mr-2" size={16} />
        Voltar para eventos
      </Link>

      <h1 className="text-2xl font-bold text-white mb-2">{evento.titulo}</h1>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex items-center text-yellow-500">
          <Calendar className="mr-1" size={16} />
          <span>
            {evento.dia} de {evento.mes} de {evento.ano}
          </span>
        </div>
        <div className="flex items-center text-yellow-500">
          <Clock className="mr-1" size={16} />
          <span>{evento.hora}</span>
        </div>
        {evento.local && (
          <div className="flex items-center text-yellow-500">
            <MapPin className="mr-1" size={16} />
            <span>{evento.local}</span>
          </div>
        )}
      </div>

      {evento.imagem && (
        <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden mb-4">
          <Image src={evento.imagem || "/placeholder.svg"} alt={evento.titulo} fill className="object-cover" />
        </div>
      )}

      <div className="bg-[#0c2657] p-4 rounded-lg">
        <div
          className="text-white prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: evento.descricao }}
        />
      </div>
    </div>
  )
}
