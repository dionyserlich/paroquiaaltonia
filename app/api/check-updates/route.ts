import { NextResponse } from "next/server"
import { query } from "@/app/lib/db"
import { sendNotificationToAll } from "@/app/actions"

export const dynamic = "force-dynamic"

const lastSeen: Record<string, string> = {}

type Check = {
  table: string
  column: string
  body: string
  url: string
  key: string
}

const checks: Check[] = [
  { table: "missas", column: "GREATEST(created_at, updated_at)", body: "Nova missa disponível!", url: "/", key: "missas" },
  { table: "eventos", column: "GREATEST(created_at, updated_at)", body: "Novos eventos foram adicionados ao calendário!", url: "/eventos", key: "eventos" },
  { table: "noticias", column: "GREATEST(created_at, updated_at)", body: "Novas notícias da paróquia disponíveis!", url: "/noticias", key: "noticias" },
  { table: "banners", column: "created_at", body: "Confira as novidades da paróquia!", url: "/", key: "banners" },
]

export async function GET() {
  try {
    const updates: string[] = []
    let triggered: Check | null = null

    for (const c of checks) {
      const { rows } = await query<{ ts: string | null }>(
        `SELECT MAX(${c.column}) AS ts FROM ${c.table}`
      )
      const ts = rows[0]?.ts
      if (!ts) continue
      const tsStr = new Date(ts).toISOString()
      if (lastSeen[c.key] === undefined) {
        lastSeen[c.key] = tsStr
        continue
      }
      if (tsStr > lastSeen[c.key]) {
        updates.push(c.key)
        if (!triggered) triggered = c
        lastSeen[c.key] = tsStr
      }
    }

    if (triggered) {
      await sendNotificationToAll("Novidades na Paróquia São Sebastião", triggered.body, triggered.url)
    }

    return NextResponse.json({ updates })
  } catch (error) {
    console.error("Erro ao verificar atualizações:", error)
    return NextResponse.json({ error: "Falha ao verificar atualizações" }, { status: 500 })
  }
}
