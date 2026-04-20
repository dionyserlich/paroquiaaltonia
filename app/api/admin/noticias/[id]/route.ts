import { NextResponse } from "next/server"
import { query } from "@/app/lib/db"

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await context.params
    const id = Number.parseInt(rawId)
    const data = await request.json()
    if (!data.titulo || !data.resumo || !data.conteudo) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }
    const { rows } = await query(
      `UPDATE noticias
       SET titulo=$1, resumo=$2, conteudo=$3, imagem=$4,
           data=COALESCE($5, data), updated_at=NOW()
       WHERE id=$6
       RETURNING id, titulo, resumo, conteudo, imagem, data`,
      [data.titulo, data.resumo, data.conteudo, data.imagem || null, data.data || null, id]
    )
    if (rows.length === 0) return NextResponse.json({ error: "Notícia não encontrada" }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (error: any) {
    console.error("Erro ao atualizar notícia:", error)
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await context.params
    const id = Number.parseInt(rawId)
    const { rowCount } = await query(`DELETE FROM noticias WHERE id=$1`, [id])
    if (!rowCount) return NextResponse.json({ error: "Notícia não encontrada" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Erro ao excluir notícia:", error)
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 })
  }
}
