import { NextResponse } from "next/server"
import { query } from "@/app/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const { rows } = await query(
      `SELECT id, titulo, inicio, fim, link_embed AS "linkEmbed", descricao
       FROM missas ORDER BY inicio DESC`
    )
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Erro ao listar missas:", error)
    return NextResponse.json([], { status: 500 })
  }
}
