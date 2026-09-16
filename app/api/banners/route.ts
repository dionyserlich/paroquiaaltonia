import { NextResponse } from "next/server"
import { consultaCacheada } from "@/app/lib/cache-consulta"
import { payloadClient } from "@/app/lib/payload"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const docs = await consultaCacheada("banners", "banners", 900, async () => {
      const payload = await payloadClient()
      const { docs } = await payload.find({ collection: "banners", sort: "ordem", depth: 1, limit: 50 })
      return docs
    })()
    return NextResponse.json(docs)
  } catch (error) {
    console.error("Erro ao listar banners:", error)
    return NextResponse.json([], { status: 500 })
  }
}
