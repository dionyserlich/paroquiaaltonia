import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { query } from "@/app/lib/db"

async function isAuthed() {
  const c = await cookies()
  return c.get("admin_auth")?.value === "true"
}

export async function POST(request: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  try {
    const data = await request.json()
    if (!data.titulo || !data.resumo || !data.conteudo) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }
    const dataPub = data.data || new Date().toISOString()
    const { rows } = await query(
      `INSERT INTO noticias (titulo, resumo, conteudo, imagem, data)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, titulo, resumo, conteudo, imagem, data`,
      [data.titulo, data.resumo, data.conteudo, data.imagem || null, dataPub]
    )
    return NextResponse.json(rows[0])
  } catch (error: any) {
    console.error("Erro ao adicionar notícia:", error)
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 })
  }
}
