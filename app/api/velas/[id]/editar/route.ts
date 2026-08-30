import { NextRequest, NextResponse } from "next/server"
import { payloadClient } from "@/app/lib/payload"
import { stripCtl, validarFoto, fileParaPayloadFile } from "../../_shared"

type Params = { params: Promise<{ id: string }> }

// Mesmo modelo de posse de /apagar. Permite editar nome, intenção, foto
// (trocar ou remover) e as três flags de privacidade — não duracaoHoras/
// expiraEm (mudar por quanto tempo já não faz muito sentido depois de
// acesa; pra isso a pessoa apaga e acende de novo).
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const formData = await request.formData()
    const payloadRaw = formData.get("_payload")
    if (typeof payloadRaw !== "string") {
      return NextResponse.json({ error: "Dados do formulário ausentes." }, { status: 400 })
    }
    const body = JSON.parse(payloadRaw)
    const ownershipToken = typeof body?.ownershipToken === "string" ? body.ownershipToken : ""

    const payload = await payloadClient()
    const doc = await payload.findByID({ collection: "velas", id }).catch(() => null)
    if (!doc) {
      return NextResponse.json({ error: "Vela não encontrada." }, { status: 404 })
    }
    if (!ownershipToken || doc.ownershipToken !== ownershipToken) {
      return NextResponse.json({ error: "Não foi possível editar esta vela." }, { status: 403 })
    }

    const nome = stripCtl(String(body?.nome ?? ""))
    const intencao = String(body?.intencao ?? "").trim()
    if (!nome || nome.length < 2 || nome.length > 100) {
      return NextResponse.json({ error: "Informe um nome (2 a 100 caracteres)." }, { status: 400 })
    }
    if (!intencao || intencao.length < 5 || intencao.length > 1000) {
      return NextResponse.json(
        { error: "Descreva a intenção (5 a 1000 caracteres)." },
        { status: 400 }
      )
    }

    const fotoFile = formData.get("foto")
    const novaFoto = fotoFile instanceof File && fotoFile.size > 0 ? fotoFile : null
    const validacaoFoto = validarFoto(novaFoto)
    if (!validacaoFoto.ok) {
      return NextResponse.json({ error: validacaoFoto.error }, { status: 400 })
    }

    let fotoId: number | null | undefined = undefined // undefined = não mexe no campo
    if (novaFoto) {
      const media = await payload.create({
        collection: "media",
        data: { alt: `Foto da vela de ${nome}` },
        file: await fileParaPayloadFile(novaFoto),
      })
      fotoId = media.id as number
    } else if (body?.removerFoto) {
      fotoId = null
    }

    await payload.update({
      collection: "velas",
      id,
      data: {
        nome,
        nomePrivado: Boolean(body?.nomePrivado),
        intencao,
        intencaoPrivada: Boolean(body?.intencaoPrivada),
        fotoPrivada: Boolean(body?.fotoPrivada),
        ...(fotoId !== undefined ? { foto: fotoId } : {}),
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[velas] erro ao editar:", err)
    return NextResponse.json({ error: "Não foi possível editar esta vela." }, { status: 500 })
  }
}
