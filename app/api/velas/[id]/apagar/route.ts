import { NextRequest, NextResponse } from "next/server"
import { payloadClient } from "@/app/lib/payload"

type Params = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const ownershipToken = typeof body?.ownershipToken === "string" ? body.ownershipToken : ""

    const payload = await payloadClient()
    const doc = await payload.findByID({ collection: "velas", id }).catch(() => null)
    if (!doc) {
      return NextResponse.json({ error: "Vela não encontrada." }, { status: 404 })
    }
    if (doc.extinta) {
      return NextResponse.json({ success: true })
    }
    if (!ownershipToken || doc.ownershipToken !== ownershipToken) {
      return NextResponse.json({ error: "Não foi possível apagar esta vela." }, { status: 403 })
    }

    await payload.update({
      collection: "velas",
      id,
      data: { extinta: true, extintaEm: new Date().toISOString() },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[velas] erro ao apagar:", err)
    return NextResponse.json({ error: "Não foi possível apagar esta vela." }, { status: 500 })
  }
}
