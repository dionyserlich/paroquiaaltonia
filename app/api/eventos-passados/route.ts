import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export async function GET() {
  try {
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

        // Criar objeto Date
        return new Date(`${evento.ano}-${mesNumero}-${evento.dia}T${hora}:00`)
      } catch (error) {
        console.error(`Erro ao processar data do evento ${evento.id}:`, error)
        return new Date(0) // Data mínima em caso de erro
      }
    }

    const hoje = new Date()

    // Filtrar apenas eventos passados
    const eventosPassados = eventos.filter((evento: any) => {
      const dataEvento = getEventoDate(evento)
      return !isNaN(dataEvento.getTime()) && dataEvento < hoje
    })

    // Ordenar eventos passados por data (mais recente primeiro)
    eventosPassados.sort((a: any, b: any) => {
      const dataA = getEventoDate(a)
      const dataB = getEventoDate(b)
      return dataB.getTime() - dataA.getTime() // Ordem decrescente de data (mais recente primeiro)
    })

    return NextResponse.json(eventosPassados)
  } catch (error) {
    console.error("Erro ao ler proximosEventos.json:", error)
    return NextResponse.json([], { status: 500 })
  }
}
