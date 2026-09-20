// Rota nova, separada de /api/missas (que continua servindo o painel admin
// antigo a partir do banco antigo) — esta busca do Payload. Consumida por
// components/live-mass-button.tsx (via lib/api.ts) e pela página /missas.
// Mesmo formato de resposta da rota antiga para não exigir mudança na lógica
// de fallback do botão de missa ao vivo, que é a feature mais crítica do site.
import { NextResponse } from "next/server"
import { consultaCacheada } from "@/app/lib/cache-consulta"
import { payloadClient } from "@/app/lib/payload"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // 60s, e não os 10 minutos iniciais: uma missa recém-transmitida precisa
    // aparecer logo na lista. Com 600s, a missa de sábado às 20h ainda mostrava
    // a de quinta como a mais recente para quem abria o site — foi o que
    // aconteceu de verdade. Conteúdo com hora marcada não tolera cache longo.
    const docs = await consultaCacheada("missas-publicas", "missas", 60, async () => {
      const payload = await payloadClient()
      const { docs } = await payload.find({ collection: "missas", sort: "-inicio", limit: 100 })
      return docs
    })()
    type MissaDoc = {
      id: number
      titulo: string
      inicio: string
      fim?: string | null
      linkEmbed?: string | null
      descricao?: string | null
    }
    const missas = (docs as MissaDoc[]).map((m) => ({
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
