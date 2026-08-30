import { randomUUID } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { payloadClient } from "@/app/lib/payload"
import { query } from "@/app/lib/db"
import { getClientIp, stripCtl, validarFoto, fileParaPayloadFile } from "./_shared"

const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_MIN = 10
// O formulário de verdade não tem campo de e-mail nenhum — um "e-mail"
// preenchido é um sinal de bot ainda mais confiável do que reaproveitar
// o nome do honeypot de intencoes ("empresa").
const HONEYPOT_FIELD = "email"
const MIN_FILL_TIME_MS = 2500

const DURACOES_VALIDAS = ["3", "7", "24", "168"]

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const payloadRaw = formData.get("_payload")
    if (typeof payloadRaw !== "string") {
      return NextResponse.json({ error: "Dados do formulário ausentes." }, { status: 400 })
    }
    const body = JSON.parse(payloadRaw)

    // Honeypot preenchido, ou formulário enviado rápido demais pra ter sido
    // digitado por uma pessoa: finge sucesso sem gravar nada, mesmo
    // comportamento de app/api/intencoes/route.ts.
    const honeypot = body?.[HONEYPOT_FIELD]
    const renderedAt = Number(body?.renderedAt)
    const tooFast = Number.isFinite(renderedAt) && Date.now() - renderedAt < MIN_FILL_TIME_MS
    if (honeypot || tooFast) {
      return NextResponse.json({ success: true, id: 0, ownershipToken: "", expiraEm: null })
    }

    const ip = getClientIp(request)
    const { rows: recentRows } = await query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM bot.velas_rate_limit
       WHERE ip = $1 AND created_at > NOW() - INTERVAL '${RATE_LIMIT_WINDOW_MIN} minutes'`,
      [ip]
    )
    if (Number(recentRows[0]?.count ?? 0) >= RATE_LIMIT_MAX) {
      return NextResponse.json(
        { error: "Muitos envios em pouco tempo. Tente novamente mais tarde." },
        { status: 429 }
      )
    }
    // Conta essa tentativa já aqui (mesmo que a validação abaixo rejeite),
    // pra não dar pra escapar do limite só variando o payload.
    await query(`INSERT INTO bot.velas_rate_limit (ip) VALUES ($1)`, [ip])

    const nome = stripCtl(String(body?.nome ?? ""))
    const nomePrivado = Boolean(body?.nomePrivado)
    const intencao = String(body?.intencao ?? "").trim()
    const intencaoPrivada = Boolean(body?.intencaoPrivada)
    const fotoPrivada = Boolean(body?.fotoPrivada)
    const duracaoHoras = String(body?.duracaoHoras ?? "")
    const notifyEndpoint = body?.notifyEndpoint ? String(body.notifyEndpoint) : null

    if (!nome || nome.length < 2 || nome.length > 100) {
      return NextResponse.json({ error: "Informe um nome (2 a 100 caracteres)." }, { status: 400 })
    }
    if (!intencao || intencao.length < 5 || intencao.length > 1000) {
      return NextResponse.json(
        { error: "Descreva a intenção (5 a 1000 caracteres)." },
        { status: 400 }
      )
    }
    if (!DURACOES_VALIDAS.includes(duracaoHoras)) {
      return NextResponse.json({ error: "Duração inválida." }, { status: 400 })
    }

    const fotoFile = formData.get("foto")
    const foto = fotoFile instanceof File && fotoFile.size > 0 ? fotoFile : null
    const validacaoFoto = validarFoto(foto)
    if (!validacaoFoto.ok) {
      return NextResponse.json({ error: validacaoFoto.error }, { status: 400 })
    }

    const payload = await payloadClient()

    let fotoId: number | null = null
    if (foto) {
      const media = await payload.create({
        collection: "media",
        data: { alt: `Foto da vela de ${nome}` },
        file: await fileParaPayloadFile(foto),
      })
      fotoId = media.id as number
    }

    const ownershipToken = randomUUID()
    const expiraEm = new Date(Date.now() + Number(duracaoHoras) * 3600_000).toISOString()

    const created = await payload.create({
      collection: "velas",
      data: {
        nome,
        nomePrivado,
        intencao,
        intencaoPrivada,
        foto: fotoId ?? undefined,
        fotoPrivada,
        duracaoHoras,
        expiraEm,
        ownershipToken,
        extinta: false,
        notifyEndpoint: notifyEndpoint ?? undefined,
      },
    })

    return NextResponse.json({ success: true, id: created.id, ownershipToken, expiraEm })
  } catch (err) {
    console.error("[velas] erro ao acender:", err)
    return NextResponse.json({ error: "Não foi possível acender a vela." }, { status: 500 })
  }
}
