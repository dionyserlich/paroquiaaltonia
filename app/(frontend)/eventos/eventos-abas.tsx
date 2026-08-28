"use client"

import { useState } from "react"
import Link from "next/link"
import { Calendar } from "lucide-react"
import { formatarData } from "@/lib/utils"
import type { Evento } from "@/app/lib/content-types"

function EventosLista({ eventos, passado }: { eventos: Evento[]; passado?: boolean }) {
  if (eventos.length === 0) {
    return (
      <div className="bg-parish-card p-6 rounded-lg text-center">
        <h2 className="text-xl text-white mb-4">{passado ? "Nenhum evento passado" : "Nenhum evento programado"}</h2>
        <p className="text-gray-300">
          {passado ? "Não há registros de eventos anteriores." : "Não há eventos programados no momento."}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {eventos.map((evento) => (
        <Link href={`/eventos/${evento.slug}`} key={evento.id}>
          <div className="bg-parish-card p-4 rounded-lg hover:bg-white/10 transition-colors mb-5">
            <h2 className="text-xl font-bold text-white">{evento.titulo}</h2>
            <div className={`flex items-center mt-2 ${passado ? "text-gray-400" : "text-yellow-500"}`}>
              <Calendar className="mr-2" size={16} />
              <span>{formatarData(evento.startAt)}</span>
            </div>
            {evento.descricao && <p className="text-gray-300 mt-2">{evento.descricao}</p>}
          </div>
        </Link>
      ))}
    </div>
  )
}

export default function EventosAbas({ proximos, passados }: { proximos: Evento[]; passados: Evento[] }) {
  const [activeTab, setActiveTab] = useState<"proximos" | "passados">("proximos")

  return (
    <div>
      <div className="flex border-b border-blue-800 mb-4">
        <button
          onClick={() => setActiveTab("proximos")}
          className={`py-2 px-4 font-medium text-sm focus:outline-none ${
            activeTab === "proximos" ? "text-yellow-500 border-b-2 border-yellow-500" : "text-gray-300 hover:text-white"
          }`}
        >
          Próximos Eventos
        </button>
        <button
          onClick={() => setActiveTab("passados")}
          className={`py-2 px-4 font-medium text-sm focus:outline-none ${
            activeTab === "passados" ? "text-yellow-500 border-b-2 border-yellow-500" : "text-gray-300 hover:text-white"
          }`}
        >
          Eventos Passados
        </button>
      </div>

      <div className="mt-4">
        {activeTab === "proximos" ? (
          <EventosLista eventos={proximos} />
        ) : (
          <EventosLista eventos={passados} passado />
        )}
      </div>
    </div>
  )
}
