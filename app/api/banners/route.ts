import { NextResponse } from "next/server"
import { query } from "@/app/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const { rows } = await query(
      `SELECT id, titulo, imagem, link FROM banners ORDER BY ordem ASC, id ASC`
    )
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Erro ao listar banners:", error)
    return NextResponse.json([], { status: 500 })
  }
}
