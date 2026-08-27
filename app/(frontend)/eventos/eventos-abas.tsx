"use client"

import { useState } from "react"
import EventosLista from "./eventos-lista"
import EventosPassados from "./eventos-passados"

export default function EventosAbas() {
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

      <div className="mt-4">{activeTab === "proximos" ? <EventosLista /> : <EventosPassados />}</div>
    </div>
  )
}
