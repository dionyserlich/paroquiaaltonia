import { NextRequest, NextResponse } from "next/server"
import { payloadClient } from "@/app/lib/payload"
import { sendEmail } from "@/app/lib/resend"
import { query } from "@/app/lib/db"

const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_MIN = 10
// Preenchido só por bots (campo escondido via CSS, fora do fluxo de tab) —
// humano nunca digita nada aqui.
const HONEYPOT_FIELD = "empresa"
// Formulário enviado rápido demais pra ter sido preenchido por uma pessoa.
const MIN_FILL_TIME_MS = 2500

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")
  return forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown"
}

const TIPOS_VALIDOS = [
  "Aniversário e Nascimento",
  "Aniversário de Casamento",
  "Ação de Graças",
  "Enfermos",
  "Falecimento",
  "Outros",
]

const DESTINATARIO = "paroquia_altonia@hotmail.com"
// Cópia para o responsável técnico saber quando chega uma intenção e poder
// reforçar o aviso pro pessoal da paróquia.
const DESTINATARIO_COPIA = "dionyserlich@gmail.com"

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

    // Honeypot preenchido, ou formulário enviado rápido demais pra ter sido
    // digitado por uma pessoa: finge sucesso sem gravar nada, pra não
    // sinalizar a um bot que foi bloqueado (ele tende a insistir se souber).
    const honeypot = body?.[HONEYPOT_FIELD]
    const renderedAt = Number(body?.renderedAt)
    const tooFast = Number.isFinite(renderedAt) && Date.now() - renderedAt < MIN_FILL_TIME_MS
    if (honeypot || tooFast) {
      return NextResponse.json({ success: true, id: 0, emailEnviado: true, emailErro: null })
    }

    const ip = getClientIp(request)
    const { rows: recentRows } = await query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM bot.intencoes_rate_limit
       WHERE ip = $1 AND created_at > NOW() - INTERVAL '${RATE_LIMIT_WINDOW_MIN} minutes'`,
      [ip],
    )
    if (Number(recentRows[0]?.count ?? 0) >= RATE_LIMIT_MAX) {
      return NextResponse.json(
        { error: "Muitos envios em pouco tempo. Tente novamente mais tarde." },
        { status: 429 },
      )
    }
    // Conta essa tentativa já aqui (mesmo que a validação abaixo rejeite),
    // pra um bot não conseguir só variar o payload e escapar do limite.
    await query(`INSERT INTO bot.intencoes_rate_limit (ip) VALUES ($1)`, [ip])

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

    const payload = await payloadClient()
    const created = await payload.create({
      collection: "intencoes",
      data: { nome, email: email || undefined, telefone, tipo, intencao, dataPreferida, status: "pendente" },
    })

    const html = `
      <h2>Nova intenção de missa</h2>
      <p><strong>Recebida em:</strong> ${escapeHtml(
        new Date(created.createdAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
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
        cc: DESTINATARIO_COPIA,
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
