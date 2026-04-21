import { NextRequest, NextResponse } from "next/server"
import { query } from "@/app/lib/db"
import { sendEmail } from "@/app/lib/resend"

const TIPOS_VALIDOS = [
  "Aniversário e Nascimento",
  "Aniversário de Casamento",
  "Ação de Graças",
  "Enfermos",
  "Falecimento",
  "Outros",
]

const DESTINATARIO = "paroquia_altonia@hotmail.com"

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const stripCtl = (s: string) => s.replace(/[\r\n\t\0]+/g, " ").trim()
    const nome = stripCtl(String(body?.nome ?? ""))
    const email = body?.email ? stripCtl(String(body.email)) : null
    const telefone = body?.telefone ? stripCtl(String(body.telefone)) : null
    const tipo = stripCtl(String(body?.tipo ?? ""))
    const intencao = String(body?.intencao ?? "").trim()
    const dataPreferida = body?.dataPreferida
      ? stripCtl(String(body.dataPreferida))
      : null

    if (!nome || nome.length < 2) {
      return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 })
    }
    if (!TIPOS_VALIDOS.includes(tipo)) {
      return NextResponse.json({ error: "Tipo de intenção inválido." }, { status: 400 })
    }
    if (!intencao || intencao.length < 5) {
      return NextResponse.json(
        { error: "Descreva a intenção com pelo menos 5 caracteres." },
        { status: 400 },
      )
    }
    if (email && (!/^[^\s<>"]+@[^\s<>"]+\.[^\s<>"]+$/.test(email) || email.length > 254)) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 })
    }

    const { rows } = await query<{ id: number; created_at: string }>(
      `INSERT INTO intencoes (nome, email, telefone, tipo, intencao, data_preferida)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, created_at`,
      [nome, email, telefone, tipo, intencao, dataPreferida],
    )
    const created = rows[0]

    const html = `
      <h2>Nova intenção de missa</h2>
      <p><strong>Recebida em:</strong> ${escapeHtml(
        new Date(created.created_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
      )}</p>
      <p><strong>Nome:</strong> ${escapeHtml(nome)}</p>
      ${email ? `<p><strong>E-mail:</strong> ${escapeHtml(email)}</p>` : ""}
      ${telefone ? `<p><strong>Telefone:</strong> ${escapeHtml(telefone)}</p>` : ""}
      <p><strong>Tipo:</strong> ${escapeHtml(tipo)}</p>
      ${dataPreferida ? `<p><strong>Data preferida:</strong> ${escapeHtml(dataPreferida)}</p>` : ""}
      <p><strong>Intenção:</strong></p>
      <p style="white-space:pre-wrap;border-left:3px solid #c9a227;padding-left:12px;">${escapeHtml(intencao)}</p>
      <hr>
      <p style="color:#666;font-size:12px;">Mensagem enviada pelo site da Paróquia São Sebastião de Altônia (registro #${created.id}).</p>
    `

    let emailEnviado = true
    let emailErro: string | null = null
    try {
      await sendEmail({
        to: DESTINATARIO,
        subject: `Nova intenção de missa: ${tipo} — ${nome}`,
        html,
        replyTo: email || undefined,
      })
    } catch (err) {
      emailEnviado = false
      emailErro = err instanceof Error ? err.message : String(err)
      console.error("[intencoes] falha ao enviar e-mail:", emailErro)
    }

    return NextResponse.json({
      success: true,
      id: created.id,
      emailEnviado,
      emailErro,
    })
  } catch (err) {
    console.error("[intencoes] erro:", err)
    return NextResponse.json(
      { error: "Não foi possível registrar a intenção." },
      { status: 500 },
    )
  }
}
