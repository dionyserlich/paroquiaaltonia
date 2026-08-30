import { NextRequest, NextResponse } from "next/server"
import { payloadClient } from "@/app/lib/payload"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

// Diferente do bot de missa (granularidade de 5 min, quase em tempo real),
// a duração mínima de uma vela é de horas — rodar a cada 15-30 min é
// suficiente. Agendado direto no painel da Vercel (ver nota no plano sobre
// não misturar com vercel.json).
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.get("authorization") ?? ""
  const provided = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : req.nextUrl.searchParams.get("secret")
  if (process.env.NODE_ENV === "production") {
    if (!cronSecret) {
      return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 })
    }
    if (provided !== cronSecret) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }
  } else if (cronSecret && provided !== cronSecret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const payload = await payloadClient()
  const nowIso = new Date().toISOString()

  const { docs } = await payload.find({
    collection: "velas",
    where: { and: [{ extinta: { equals: false } }, { expiraEm: { less_than_equal: nowIso } }] },
    limit: 100,
  })

  let fechadas = 0
  let notificadas = 0
  for (const doc of docs) {
    try {
      await payload.update({ collection: "velas", id: doc.id, data: { extinta: true, extintaEm: nowIso } })
      fechadas++

      if (doc.notifyEndpoint) {
        const { sendNotificationToOne } = await import("@/app/actions")
        const nome = doc.nomePrivado ? "" : ` por ${doc.nome}`
        const result = await sendNotificationToOne(
          doc.notifyEndpoint,
          "Sua vela apagou",
          `A vela que você acendeu${nome} já completou o tempo. Você pode acender outra quando quiser.`,
          "/velas"
        )
        if (result.success) notificadas++
      }
    } catch (err) {
      console.error("[cron] falha ao fechar/notificar vela:", doc.id, err)
    }
  }

  return NextResponse.json({ verificadas: docs.length, fechadas, notificadas })
}
