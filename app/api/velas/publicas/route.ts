// Mesmo formato de app/api/missas/publicas/route.ts: busca via Local API
// (não REST) e reformata a resposta manualmente — é o único jeito de
// redigir nome/intenção/foto por documento conforme as flags de
// privacidade, já que o access control do Payload não faz isso sozinho
// (é tudo ou nada por operação, não por campo condicional).
import { NextResponse } from "next/server"
import { consultaCacheada } from "@/app/lib/cache-consulta"
import { payloadClient } from "@/app/lib/payload"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const docs = await consultaCacheada("velas-publicas", "velas", 60, async () => {
      const payload = await payloadClient()
      const { docs } = await payload.find({
        collection: "velas",
        where: {
          and: [{ extinta: { equals: false } }, { expiraEm: { greater_than_equal: new Date().toISOString() } }],
        },
        sort: "-createdAt",
        limit: 100,
      })
      return docs
    })()

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

    // O filtro de expiraEm na consulta vale para o instante em que ela rodou,
    // não para agora. Vencido o TTL, o unstable_cache devolve a entrada velha
    // e só então atualiza em segundo plano (e o último-bom-resultado pode ter
    // dias): numa página com poucas visitas, quem abria /velas depois de um
    // tempo parado via acesas velas que tinham apagado dias antes. Refiltrar
    // aqui não custa consulta nenhuma.
    const agora = Date.now()
    const velas = (docs as VelaDoc[])
      .filter((v) => new Date(v.expiraEm).getTime() > agora)
      .map((v) => ({
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
