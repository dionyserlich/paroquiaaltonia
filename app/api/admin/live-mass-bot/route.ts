import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { runLiveMassCheck, getRecentLogs, getCurrentLiveMass } from "@/app/lib/live-mass-bot"
import { findActiveMassWindow } from "@/app/lib/mass-schedule"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

async function isAuthed() {
  const c = await cookies()
  return c.get("admin_auth")?.value === "true"
}

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const [logs, current] = await Promise.all([getRecentLogs(20), getCurrentLiveMass()])
  const win = findActiveMassWindow()
  return NextResponse.json({
    logs,
    current,
    window: {
      inWindow: win.inWindow,
      slot: win.slot ?? null,
      startsAt: win.startsAt ?? null,
      endsAt: win.endsAt ?? null,
      nextSlot: win.nextSlot ?? null,
      nextStartsAt: win.nextStartsAt ?? null,
    },
  })
}

export async function POST() {
  if (!(await isAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const result = await runLiveMassCheck("manual")
  return NextResponse.json(result)
}
