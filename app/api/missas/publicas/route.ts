// Rota nova, separada de /api/missas (que continua servindo o painel admin
// antigo a partir do banco antigo) — esta busca do Payload. Consumida por
// components/live-mass-button.tsx (via lib/api.ts) e pela página /missas.
// Mesmo formato de resposta da rota antiga para não exigir mudança na lógica
// de fallback do botão de missa ao vivo, que é a feature mais crítica do site.
import { NextResponse } from "next/server"
import { payloadClient } from "@/app/lib/payload"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: "missas",
      sort: "-inicio",
      limit: 100,
    })
    const missas = docs.map((m: any) => ({
      id: m.id,
      titulo: m.titulo,
      inicio: m.inicio,
      fim: m.fim,
      linkEmbed: m.linkEmbed,
      descricao: m.descricao,
    }))
    return NextResponse.json(missas)
  } catch (error) {
    console.error("Erro ao listar missas:", error)
    return NextResponse.json([], { status: 500 })
  }
}
