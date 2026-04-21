import { NextRequest, NextResponse } from "next/server"
import { runLiveMassCheck } from "@/app/lib/live-mass-bot"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.get("authorization") ?? ""
  const provided = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : req.nextUrl.searchParams.get("secret")
  if (process.env.NODE_ENV === "production") {
    if (!cronSecret) {
      return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 })
    }
    if (provided !== cronSecret) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }
  } else if (cronSecret && provided !== cronSecret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const result = await runLiveMassCheck("cron")
  return NextResponse.json(result)
}
