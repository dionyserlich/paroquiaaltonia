// Mesmo formato de app/api/missas/publicas/route.ts: busca via Local API
// (não REST) e reformata a resposta manualmente — é o único jeito de
// redigir nome/intenção/foto por documento conforme as flags de
// privacidade, já que o access control do Payload não faz isso sozinho
// (é tudo ou nada por operação, não por campo condicional).
import { NextResponse } from "next/server"
import { payloadClient } from "@/app/lib/payload"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: "velas",
      where: {
        and: [{ extinta: { equals: false } }, { expiraEm: { greater_than_equal: new Date().toISOString() } }],
      },
      sort: "-createdAt",
      limit: 100,
    })

    type VelaDoc = {
      id: number
      nome: string
      nomePrivado?: boolean | null
      intencao: string
      intencaoPrivada?: boolean | null
      foto?: { url?: string | null } | number | null
      fotoPrivada?: boolean | null
      createdAt: string
      expiraEm: string
    }

    const velas = (docs as VelaDoc[]).map((v) => ({
      id: v.id,
      nome: v.nomePrivado ? null : v.nome,
      intencao: v.intencaoPrivada ? null : v.intencao,
      intencaoPrivada: Boolean(v.intencaoPrivada),
      foto: v.fotoPrivada ? null : typeof v.foto === "object" ? v.foto?.url ?? null : null,
      createdAt: v.createdAt,
      expiraEm: v.expiraEm,
    }))

    return NextResponse.json(velas)
  } catch (error) {
    console.error("Erro ao listar velas:", error)
    return NextResponse.json([], { status: 500 })
  }
}
