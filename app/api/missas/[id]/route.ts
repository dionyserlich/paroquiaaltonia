import { NextResponse } from "next/server"
import { query } from "@/app/lib/db"

export const dynamic = "force-dynamic"

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await context.params
    const id = Number.parseInt(rawId)
    const { rows } = await query(
      `SELECT id, titulo, inicio, fim, link_embed AS "linkEmbed", descricao
       FROM missas WHERE id=$1`,
      [id]
    )
    if (rows.length === 0) return NextResponse.json({ error: "Missa não encontrada" }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("Erro ao buscar missa:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
