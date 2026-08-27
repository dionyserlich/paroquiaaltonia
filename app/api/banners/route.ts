import { NextResponse } from "next/server"
import { payloadClient } from "@/app/lib/payload"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: "banners",
      sort: "ordem",
      depth: 1,
      limit: 50,
    })
    return NextResponse.json(docs)
  } catch (error) {
    console.error("Erro ao listar banners:", error)
    return NextResponse.json([], { status: 500 })
  }
}
