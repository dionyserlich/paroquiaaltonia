import { NextResponse } from "next/server"
import { query } from "@/app/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const { rows } = await query(
      `SELECT id, titulo, resumo, conteudo, imagem, data
       FROM noticias ORDER BY data DESC`
    )
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Erro ao obter notícias:", error)
    return NextResponse.json({ error: "Erro ao obter notícias" }, { status: 500 })
  }
}
