import { NextResponse } from "next/server"
import { query } from "@/app/lib/db"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    if (!data.titulo || !data.dia || !data.mes || !data.ano || !data.hora) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }
    const { rows } = await query(
      `INSERT INTO eventos (titulo, dia, mes, ano, hora, descricao, conteudo)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, titulo, dia, mes, ano, hora, descricao, conteudo`,
      [
        data.titulo,
        String(data.dia),
        String(data.mes),
        String(data.ano),
        String(data.hora),
        data.descricao || null,
        data.conteudo || null,
      ]
    )
    return NextResponse.json(rows[0])
  } catch (error: any) {
    console.error("Erro ao adicionar evento:", error)
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 })
  }
}
