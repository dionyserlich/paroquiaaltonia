// A listagem pública (/publicas) nunca devolve nome/intenção/foto quando
// marcados como privados — pra ninguém, nem pra quem acendeu, porque
// aquela rota não sabe quem está perguntando. Esta rota é como o dono
// (provando posse com o ownershipToken, mesmo padrão de /apagar) vê os
// próprios campos de verdade, pra mostrar "Só você vê esta informação."
// com o valor real em vez do valor redigido.
import { NextRequest, NextResponse } from "next/server"
import { payloadClient } from "@/app/lib/payload"

type Params = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const ownershipToken = request.nextUrl.searchParams.get("ownershipToken") ?? ""

    const payload = await payloadClient()
    const doc = await payload.findByID({ collection: "velas", id }).catch(() => null)
    if (!doc) {
      return NextResponse.json({ error: "Vela não encontrada." }, { status: 404 })
    }
    if (!ownershipToken || doc.ownershipToken !== ownershipToken) {
      return NextResponse.json({ error: "Não foi possível ver esta vela." }, { status: 403 })
    }

    const foto = typeof doc.foto === "object" ? doc.foto : null

    return NextResponse.json({
      id: doc.id,
      nome: doc.nome,
      nomePrivado: Boolean(doc.nomePrivado),
      intencao: doc.intencao,
      intencaoPrivada: Boolean(doc.intencaoPrivada),
      foto: foto?.url ?? null,
      fotoPrivada: Boolean(doc.fotoPrivada),
      duracaoHoras: doc.duracaoHoras,
      createdAt: doc.createdAt,
      expiraEm: doc.expiraEm,
    })
  } catch (err) {
    console.error("[velas] erro ao ver vela própria:", err)
    return NextResponse.json({ error: "Não foi possível ver esta vela." }, { status: 500 })
  }
}
