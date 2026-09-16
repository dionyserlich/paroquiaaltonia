import { NextResponse } from "next/server"
import { consultaCacheada } from "@/app/lib/cache-consulta"
import { getCurrentLiveMass } from "@/app/lib/live-mass-bot"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  try {
    const current = await consultaCacheada("missa-ao-vivo", "missa-ao-vivo", 60, getCurrentLiveMass)()
    return NextResponse.json(current)
  } catch (err) {
    console.error("Erro ao buscar missa ao vivo:", err)
    return NextResponse.json(null, { status: 500 })
  }
}
