import { NextResponse } from "next/server"
import { consultaCacheada } from "@/app/lib/cache-consulta"
import { payloadClient } from "@/app/lib/payload"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const docs = await consultaCacheada("ultimas-noticias", "noticias", 300, async () => {
      const payload = await payloadClient()
      const { docs } = await payload.find({ collection: "noticias", sort: "-data", depth: 1, limit: 5 })
      return docs
    })()
    return NextResponse.json(docs)
  } catch (error) {
    console.error("Erro ao listar últimas notícias:", error)
    return NextResponse.json([], { status: 500 })
  }
}
