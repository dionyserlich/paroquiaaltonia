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

    // Ordenar por data
    eventos.sort((a: any, b: any) => {
      const dataA = new Date(`${a.ano}-${a.mes}-${a.dia} ${a.hora}`)
      const dataB = new Date(`${b.ano}-${b.mes}-${b.dia} ${b.hora}`)
      return dataA.getTime() - dataB.getTime()
    })

    // Filtrar apenas eventos futuros
    const hoje = new Date()
    const eventosFuturos = eventos.filter((evento: any) => {
      try {
        // Converter mês de texto para número se necessário
        let mesNumero = evento.mes
        if (isNaN(Number.parseInt(evento.mes))) {
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
          mesNumero = meses[evento.mes] || "01"
        }

        // Extrair apenas a hora e minuto do formato de hora (ex: "20:30h" -> "20:30")
        const hora = evento.hora.replace(/[^\d:]/g, "")

        const dataEvento = new Date(`${evento.ano}-${mesNumero}-${evento.dia}T${hora}:00`)
        return !isNaN(dataEvento.getTime()) && dataEvento >= hoje
      } catch (error) {
        console.error(`Erro ao processar data do evento ${evento.id}:`, error)
        return false
      }
    })

    // Se não houver eventos futuros, retornar todos os eventos para não mostrar tela vazia
    return NextResponse.json(eventosFuturos.length > 0 ? eventosFuturos : eventos)
  } catch (error) {
    console.error("Erro ao ler proximosEventos.json:", error)
    return NextResponse.json([], { status: 500 })
  }
}
