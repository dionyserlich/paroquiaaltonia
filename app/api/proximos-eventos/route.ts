import { NextResponse } from "next/server"
import { query } from "@/app/lib/db"

export const dynamic = "force-dynamic"

const meses: Record<string, string> = {
  Janeiro: "01", Fevereiro: "02", "Março": "03", Marco: "03", Abril: "04",
  Maio: "05", Junho: "06", Julho: "07", Agosto: "08", Setembro: "09",
  Outubro: "10", Novembro: "11", Dezembro: "12",
}

function getEventoDate(evento: any) {
  try {
    let mesNumero = evento.mes
    if (isNaN(Number.parseInt(evento.mes))) {
      mesNumero = meses[evento.mes] || "01"
    }
    const hora = String(evento.hora).replace(/[^\d:]/g, "")
    const dataString = `${evento.ano}-${mesNumero}-${String(evento.dia).padStart(2, "0")}T${hora}:00`
    const dataEvento = new Date(dataString)
    return new Date(dataEvento.getTime() + 3 * 60 * 60 * 1000)
  } catch {
    return new Date(0)
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const incluirPassados = searchParams.get("incluirPassados") === "true"

    const { rows: eventos } = await query(
      `SELECT id, titulo, dia, mes, ano, hora, descricao, conteudo FROM eventos`
    )

    const hoje = new Date()

    if (incluirPassados) {
      eventos.sort((a: any, b: any) => getEventoDate(b).getTime() - getEventoDate(a).getTime())
      return NextResponse.json(eventos)
    }

    const futuros = eventos
      .filter((e: any) => {
        const d = getEventoDate(e)
        return !isNaN(d.getTime()) && d >= hoje
      })
      .sort((a: any, b: any) => getEventoDate(a).getTime() - getEventoDate(b).getTime())

    return NextResponse.json(futuros)
  } catch (error) {
    console.error("Erro ao listar próximos eventos:", error)
    return NextResponse.json([], { status: 500 })
  }
}
