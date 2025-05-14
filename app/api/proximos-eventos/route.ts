import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const incluirPassados = searchParams.get("incluirPassados") === "true"

    const filePath = path.join(process.cwd(), "data", "proximosEventos.json")

    // Verificar se o arquivo existe
    try {
      await fs.access(filePath)
    } catch (error) {
      console.error("Arquivo proximosEventos.json não encontrado:", error)
      return NextResponse.json([], { status: 404 })
    }

    const fileData = await fs.readFile(filePath, "utf8")

    // Verificar se o conteúdo do arquivo é um JSON válido
    let eventos
    try {
      eventos = JSON.parse(fileData)

      // Verificar se o resultado é um array
      if (!Array.isArray(eventos)) {
        console.error("O arquivo proximosEventos.json não contém um array")
        return NextResponse.json([], { status: 500 })
      }
    } catch (error) {
      console.error("Erro ao fazer parse do JSON:", error)
      return NextResponse.json([], { status: 500 })
    }

    // Garantir que todos os eventos tenham os campos necessários
    eventos = eventos.filter((evento: any) => {
      return (
        evento &&
        typeof evento === "object" &&
        evento.id &&
        evento.titulo &&
        evento.dia &&
        evento.mes &&
        evento.ano &&
        evento.hora
      )
    })

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
        // Isso garante que a data seja interpretada corretamente independente do fuso do servidor
        const dataAjustada = new Date(dataEvento.getTime() + 3 * 60 * 60 * 1000)

        return dataAjustada
      } catch (error) {
        console.error(`Erro ao processar data do evento ${evento.id}:`, error)
        return new Date(0) // Data mínima em caso de erro
      }
    }

    // Obter a data atual no fuso horário local
    const hoje = new Date()

    // Se incluirPassados for true, retornar todos os eventos
    if (incluirPassados) {
      // Ordenar todos os eventos por data (mais recente primeiro)
      eventos.sort((a: any, b: any) => {
        const dataA = getEventoDate(a)
        const dataB = getEventoDate(b)
        return dataB.getTime() - dataA.getTime() // Ordem decrescente de data
      })

      return NextResponse.json(eventos)
    }

    // Filtrar apenas eventos futuros
    const eventosFuturos = eventos.filter((evento: any) => {
      const dataEvento = getEventoDate(evento)
      console.log(`Evento: ${evento.titulo}, Data: ${dataEvento}, Hoje: ${hoje}, É futuro: ${dataEvento >= hoje}`)
      return !isNaN(dataEvento.getTime()) && dataEvento >= hoje
    })

    // Ordenar eventos futuros por data (mais próximo primeiro)
    eventosFuturos.sort((a: any, b: any) => {
      const dataA = getEventoDate(a)
      const dataB = getEventoDate(b)
      return dataA.getTime() - dataB.getTime() // Ordem crescente de data (mais próximo primeiro)
    })

    return NextResponse.json(eventosFuturos)
  } catch (error) {
    console.error("Erro ao ler proximosEventos.json:", error)
    return NextResponse.json([], { status: 500 })
  }
}
