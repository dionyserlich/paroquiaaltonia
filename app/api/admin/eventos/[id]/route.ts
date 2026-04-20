import { NextResponse } from "next/server"
import { query } from "@/app/lib/db"

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await context.params
    const id = Number.parseInt(rawId)
    const data = await request.json()
    if (!data.titulo || !data.dia || !data.mes || !data.ano || !data.hora) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }
    const { rows } = await query(
      `UPDATE eventos
       SET titulo=$1, dia=$2, mes=$3, ano=$4, hora=$5,
           descricao=$6, conteudo=$7, updated_at=NOW()
       WHERE id=$8
       RETURNING id, titulo, dia, mes, ano, hora, descricao, conteudo`,
      [
        data.titulo,
        String(data.dia),
        String(data.mes),
        String(data.ano),
        String(data.hora),
        data.descricao || null,
        data.conteudo || null,
        id,
      ]
    )
    if (rows.length === 0) return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (error: any) {
    console.error("Erro ao atualizar evento:", error)
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await context.params
    const id = Number.parseInt(rawId)
    const { rowCount } = await query(`DELETE FROM eventos WHERE id=$1`, [id])
    if (!rowCount) return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Erro ao excluir evento:", error)
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 })
  }
}
