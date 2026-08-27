// Rota nova, separada de /api/proximos-eventos (que continua servindo o
// painel admin antigo a partir do banco antigo) — esta já busca do Payload,
// usada pelo widget de eventos da home (components/events-list.tsx).
import { NextResponse } from "next/server"
import { payloadClient } from "@/app/lib/payload"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: "eventos",
      where: { startAt: { greater_than_equal: new Date().toISOString() } },
      sort: "startAt",
      limit: 4,
    })
    return NextResponse.json(docs)
  } catch (error) {
    console.error("Erro ao listar próximos eventos:", error)
    return NextResponse.json([], { status: 500 })
  }
}
