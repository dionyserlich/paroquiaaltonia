import { NextResponse } from "next/server"
import { query } from "@/app/lib/db"

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await context.params
    const id = Number.parseInt(rawId)
    const data = await request.json()
    if (!data.titulo || !data.inicio || !data.fim || !data.linkEmbed) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }
    const { rows } = await query(
      `UPDATE missas
       SET titulo=$1, inicio=$2, fim=$3, link_embed=$4, descricao=$5, updated_at=NOW()
       WHERE id=$6
       RETURNING id, titulo, inicio, fim, link_embed AS "linkEmbed", descricao`,
      [data.titulo, data.inicio, data.fim, data.linkEmbed, data.descricao || null, id]
    )
    if (rows.length === 0) return NextResponse.json({ error: "Missa não encontrada" }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (error: any) {
    console.error("Erro ao atualizar missa:", error)
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await context.params
    const id = Number.parseInt(rawId)
    const { rowCount } = await query(`DELETE FROM missas WHERE id=$1`, [id])
    if (!rowCount) return NextResponse.json({ error: "Missa não encontrada" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Erro ao excluir missa:", error)
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 })
  }
}
