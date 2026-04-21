import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { query } from "@/app/lib/db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

async function isAuthed() {
  const c = await cookies()
  return c.get("admin_auth")?.value === "true"
}

export async function GET(req: NextRequest) {
  if (!(await isAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const url = new URL(req.url)
  const status = url.searchParams.get("status")
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "100"), 500)
  const rows = status
    ? await query(
        `SELECT id, nome, email, telefone, tipo, intencao, data_preferida, status, created_at
         FROM intencoes WHERE status = $1 ORDER BY created_at DESC LIMIT $2`,
        [status, limit],
      )
    : await query(
        `SELECT id, nome, email, telefone, tipo, intencao, data_preferida, status, created_at
         FROM intencoes ORDER BY created_at DESC LIMIT $1`,
        [limit],
      )
  return NextResponse.json({ intencoes: rows })
}

export async function PATCH(req: NextRequest) {
  if (!(await isAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const body = await req.json().catch(() => null)
  const id = Number(body?.id)
  const status = String(body?.status ?? "")
  if (!id || !["pendente", "atendida", "arquivada"].includes(status)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 })
  }
  await query(`UPDATE intencoes SET status = $1 WHERE id = $2`, [status, id])
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const url = new URL(req.url)
  const id = Number(url.searchParams.get("id"))
  if (!id) return NextResponse.json({ error: "invalid" }, { status: 400 })
  await query(`DELETE FROM intencoes WHERE id = $1`, [id])
  return NextResponse.json({ ok: true })
}
