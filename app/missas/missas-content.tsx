"use client"

import { useState, useEffect } from "react"
import { Clock, Calendar, MapPin, Users, Church, Play, ExternalLink } from "lucide-react"
import { formatarData } from "@/lib/utils"

interface Missa {
  id: string
  titulo: string
  dataTransmissao: string
  linkVideo: string
}

export default function MissasContent() {
  const [missasAnteriores, setMissasAnteriores] = useState<Missa[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregarMissas() {
      try {
        const response = await fetch("/api/missas")
        if (response.ok) {
          const data = await response.json()
          // Filtrar apenas os campos necessários
          const missasFormatadas = data.map((missa: any) => ({
            id: missa.id,
            titulo: missa.titulo,
            dataTransmissao: missa.inicio,
            linkVideo: missa.linkEmbed,
          }))
          setMissasAnteriores(missasFormatadas)
        }
      } catch (error) {
        console.error("Erro ao carregar missas:", error)
      } finally {
        setLoading(false)
      }
    }

    carregarMissas()
  }, [])

  const horariosMissas = [
    {
      dia: "Segunda à Sexta-feira",
      horarios: ["07h30", "20h00"],
      icon: <Clock className="w-5 h-5" />,
    },
    {
      dia: "Sábado",
      horarios: ["20h00"],
      icon: <Clock className="w-5 h-5" />,
    },
    {
      dia: "Domingo",
      horarios: ["08h30", "10h30", "18h00"],
      icon: <Clock className="w-5 h-5" />,
    },
    {
      dia: "1ª Sexta-feira do mês",
      horarios: ["20h00"],
      especial: "Apostolado da Oração",
      icon: <Users className="w-5 h-5" />,
    },
    {
      dia: "3ª Quarta-feira do mês",
      horarios: ["20h00"],
      especial: "RCC",
      icon: <Users className="w-5 h-5" />,
    },
    {
      dia: "4ª Sexta-feira do mês",
      horarios: ["15h00"],
      especial: "Enfermos",
      icon: <Users className="w-5 h-5" />,
    },
  ]

  const abrirVideo = (linkVideo: string) => {
    if (linkVideo) {
      window.open(linkVideo, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0c2657] to-[#1a3a7a] text-white">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="bg-yellow-500 p-4 rounded-full">
              <Church className="w-8 h-8 text-[#0c2657]" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Missas</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Horários das celebrações eucarísticas e missas anteriores da nossa paróquia
          </p>
        </div>

        {/* Horários das Missas */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-yellow-500 flex items-center">
            <Clock className="w-6 h-6 mr-2" />
            Horários das Missas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {horariosMissas.map((item, index) => (
              <div
                key={index}
                className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <div className="text-yellow-500">{item.icon}</div>
                  <h3 className="font-semibold text-sm">{item.dia}</h3>
                </div>
                <div className="space-y-2">
                  {item.horarios.map((horario, idx) => (
                    <div key={idx} className="text-white font-medium">
                      {horario}
                    </div>
                  ))}
                  {item.especial && (
                    <div className="text-yellow-500 text-xs font-medium bg-yellow-500/20 px-2 py-1 rounded">
                      {item.especial}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Local */}
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-3">
            <MapPin className="w-6 h-6 text-yellow-500" />
            <h3 className="text-xl font-bold">Local das Celebrações</h3>
          </div>
          <p className="text-gray-300">
            <strong>Igreja Matriz São Sebastião</strong>
            <br />
            Rua da Bandeira, 426 – Centro
            <br />
            Altônia – PR
          </p>
        </div>

        {/* Missas Anteriores */}
        <div className="bg-white/5 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-yellow-500 flex items-center">
            <Play className="w-6 h-6 mr-2" />
            Missas Anteriores
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
              <p className="text-gray-300 mt-2">Carregando missas...</p>
            </div>
          ) : missasAnteriores.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {missasAnteriores.map((missa) => (
                <div
                  key={missa.id}
                  className="bg-white/10 rounded-lg p-4 border border-white/10 hover:bg-white/15 transition-all duration-300 group"
                >
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg line-clamp-2">{missa.titulo}</h3>

                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <Calendar className="w-4 h-4" />
                      <span>{formatarData(missa.dataTransmissao)}</span>
                    </div>

                    {missa.linkVideo ? (
                      <button
                        onClick={() => abrirVideo(missa.linkVideo)}
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 group-hover:scale-105"
                      >
                        <Play className="w-4 h-4" />
                        <span>Assistir Missa</span>
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="w-full bg-gray-600 text-gray-300 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 cursor-not-allowed">
                        <Play className="w-4 h-4 opacity-50" />
                        <span>Vídeo indisponível</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-300">
              <Church className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma missa anterior registrada ainda.</p>
            </div>
          )}
        </div>

        {/* Informações Adicionais */}
        <div className="bg-white/5 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-yellow-500">Informações Importantes</h3>
          <div className="space-y-3 text-gray-300">
            <p>• Chegue com alguns minutos de antecedência</p>
            <p>• Traga sua família e amigos para participar</p>
            <p>• Em caso de dúvidas, entre em contato conosco</p>
            <p>• Acompanhe nossas redes sociais para avisos especiais</p>
          </div>
        </div>
      </div>
    </main>
  )
}
