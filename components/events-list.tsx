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
          // Função para converter data do evento para objeto Date
          const getEventoDate = (evento: any) => {
            try {
              // Converter mês de texto para número
              const meses: Record<string, string> = {
                Janeiro: "01",
                Fevereiro: "02",
                Março: "03",
                Abril: "04",
                Maio: "05",
                Junho: "06",
                Julho: "07",
                Agosto: "08",
                Setembro: "09",
                Outubro: "10",
                Novembro: "11",
                Dezembro: "12",
              }

              let mesNumero = evento.mes
              if (isNaN(Number.parseInt(evento.mes))) {
                mesNumero = meses[evento.mes] || "01"
              }

              // Extrair apenas a hora e minuto do formato de hora (ex: "20:30h" -> "20:30")
              const hora = evento.hora.replace(/[^\d:]/g, "")

              // Criar objeto Date usando UTC para evitar problemas de fuso horário
              const dataString = `${evento.ano}-${mesNumero}-${evento.dia}T${hora}:00`
              const dataEvento = new Date(dataString)

              // Ajustar para o fuso horário local do Brasil (UTC-3)
              const dataAjustada = new Date(dataEvento.getTime() + 3 * 60 * 60 * 1000)

              return dataAjustada
            } catch (error) {
              console.error(`Erro ao processar data do evento ${evento.id}:`, error)
              return new Date(0) // Data mínima em caso de erro
            }
          }

          // Ordenar eventos por data (mais próximo primeiro)
          const sortedEventos = [...eventosData].sort((a, b) => {
            const dataA = getEventoDate(a)
            const dataB = getEventoDate(b)
            return dataA.getTime() - dataB.getTime() // Ordem crescente de data (mais próximo primeiro)
          })

          setEventos(sortedEventos.slice(0, 4)) // Limitar a 4 eventos
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
            <div className="text-yellow-500 font-bold mr-3 text-center min-w-[60px]">
              <div className="text-[16pt]">{evento.dia}</div>
              <div className="text-[8pt]">{evento.mes}</div>
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
