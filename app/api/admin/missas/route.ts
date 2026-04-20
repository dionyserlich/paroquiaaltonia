import { NextResponse } from "next/server"
import { query } from "@/app/lib/db"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    if (!data.titulo || !data.inicio || !data.fim || !data.linkEmbed) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }
    const { rows } = await query(
      `INSERT INTO missas (titulo, inicio, fim, link_embed, descricao)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, titulo, inicio, fim, link_embed AS "linkEmbed", descricao`,
      [data.titulo, data.inicio, data.fim, data.linkEmbed, data.descricao || null]
    )
    return NextResponse.json(rows[0])
  } catch (error: any) {
    console.error("Erro ao adicionar missa:", error)
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 })
  }
}
