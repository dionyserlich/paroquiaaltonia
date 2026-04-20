import { NextResponse } from "next/server"
import { query } from "@/app/lib/db"

export const dynamic = "force-dynamic"

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await context.params
    const id = Number.parseInt(rawId)
    const { rows } = await query(
      `SELECT id, titulo, resumo, conteudo, imagem, data
       FROM noticias WHERE id=$1`,
      [id]
    )
    if (rows.length === 0) return NextResponse.json({ error: "Notícia não encontrada" }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("Erro ao obter notícia:", error)
    return NextResponse.json({ error: "Erro ao obter notícia" }, { status: 500 })
  }
}
