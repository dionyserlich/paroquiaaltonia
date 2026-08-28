"use client"

import { useState } from "react"
import Image from "next/image"
import { Church, MapPin, Clock } from "lucide-react"

export type Capela = {
  id: number
  nome: string
  zona?: "urbana" | "rural" | null
  endereco?: string | null
  mapaEmbedUrl?: string | null
  horarios?: { diaSemana: string; horario: string; observacao?: string | null }[] | null
  foto?: { url?: string | null; alt?: string | null } | number | null
  observacao?: string | null
}

// Aceita tanto o <iframe> inteiro colado do "Compartilhar → Incorporar um
// mapa" do Google Maps quanto só o link — extrai a URL de qualquer um dos
// dois formatos.
function extractMapSrc(value?: string | null): string | null {
  if (!value) return null
  const iframeMatch = value.match(/src="([^"]+)"/)
  if (iframeMatch) return iframeMatch[1]
  if (value.trim().startsWith("http")) return value.trim()
  return null
}

const ZONA_LABEL: Record<string, string> = { urbana: "Urbana", rural: "Rural" }

export default function CapelasContent({ capelas }: { capelas: Capela[] }) {
  const [filtro, setFiltro] = useState<"todas" | "urbana" | "rural">("todas")

  const temUrbana = capelas.some((c) => c.zona === "urbana")
  const temRural = capelas.some((c) => c.zona === "rural")
  const capelasFiltradas = capelas.filter((c) => filtro === "todas" || c.zona === filtro)

  return (
    <div className="container mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-4">
          <div className="bg-yellow-500 p-4 rounded-full">
            <Church className="w-8 h-8 text-[#0c2657]" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">Capelas e Comunidades</h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Além da Igreja Matriz, a paróquia conta com diversas capelas e comunidades espalhadas pela cidade e pela
          zona rural.
        </p>
      </div>

      {(temUrbana || temRural) && (
        <div className="flex justify-center gap-2">
          {(["todas", "urbana", "rural"] as const).map((opcao) => (
            <button
              key={opcao}
              onClick={() => setFiltro(opcao)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filtro === opcao ? "bg-yellow-500 text-[#4d3600]" : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              {opcao === "todas" ? "Todas" : ZONA_LABEL[opcao]}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {capelasFiltradas.map((capela) => {
          const foto = typeof capela.foto === "object" ? capela.foto : null
          const mapSrc = extractMapSrc(capela.mapaEmbedUrl)
          return (
            <div key={capela.id} className="bg-parish-card rounded-lg overflow-hidden border-l-4 border-yellow-500">
              {foto?.url && (
                <div className="relative w-full h-40">
                  <Image src={foto.url} alt={foto.alt || capela.nome} fill className="object-cover" />
                </div>
              )}
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xl font-bold">{capela.nome}</h3>
                  {capela.zona && (
                    <span className="shrink-0 text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full">
                      {ZONA_LABEL[capela.zona]}
                    </span>
                  )}
                </div>

                {capela.endereco && (
                  <div className="flex items-start gap-2 text-gray-300 text-sm">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-yellow-500" />
                    <span>{capela.endereco}</span>
                  </div>
                )}

                {capela.horarios && capela.horarios.length > 0 && (
                  <div className="space-y-1.5">
                    {capela.horarios.map((h, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                        <Clock className="w-4 h-4 mt-0.5 shrink-0 text-yellow-500" />
                        <span>
                          {h.diaSemana} — {h.horario}
                          {h.observacao && <span className="text-gray-400"> ({h.observacao})</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {capela.observacao && <p className="text-gray-300 text-sm">{capela.observacao}</p>}

                {mapSrc && (
                  <iframe
                    src={mapSrc}
                    className="w-full h-40 rounded-md border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Mapa — ${capela.nome}`}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white/5 rounded-lg p-6 text-center">
        <p className="text-gray-300 text-sm">
          Conhece o horário de missa ou o endereço de alguma dessas comunidades? Procure a secretaria paroquial pra
          ajudar a completar essas informações.
        </p>
      </div>
    </div>
  )
}
