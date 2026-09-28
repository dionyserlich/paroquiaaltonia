import { NextRequest, NextResponse } from "next/server"
import { consultaCacheada } from "@/app/lib/cache-consulta"
import { payloadClient } from "@/app/lib/payload"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

// Quando vence a próxima vela ainda acesa. Fica no cache de dados do Next, e
// não no banco, porque é isso que deixa o cron rodar a cada 15 minutos sem
// acordar a Neon toda vez: com o banco adormecendo após 5 minutos parado, um
// cron que consulta sempre o mantém ligado boa parte do dia (ver
// app/lib/cache-consulta.ts). Por causa disso o agendamento tinha sido
// espaçado para uma vez ao dia, e o aviso de "sua vela apagou" chegava até
// um dia depois de a vela apagar.
//
// Toda gravação em velas invalida a tag (hook em collections/Velas.ts), então
// uma vela recém-acesa entra na conta na execução seguinte. As 6 horas são só
// a rede de segurança caso uma invalidação se perca.
const proximaExpiracao = consultaCacheada("velas-proxima-expiracao", "velas", 6 * 3600, async () => {
  const payload = await payloadClient()
  const { docs } = await payload.find({
    collection: "velas",
    where: { extinta: { equals: false } },
    sort: "expiraEm",
    limit: 1,
    depth: 0,
  })
  return docs[0]?.expiraEm ?? null
})

// Dia em que a vela foi acesa, para o aviso dizer de qual vela se trata —
// com o nome privado, o texto não trazia nada que a identificasse. Fuso fixo
// porque o servidor roda em UTC (mesmo motivo de lib/utils.ts).
function diaEmQueAcendeu(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(iso))
}

// Chamado pelo agendador externo (cron-job.org), como o bot de missa.
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

  // Nenhuma vela vencida: responde sem tocar no banco.
  const proxima = await proximaExpiracao()
  if (!proxima || new Date(proxima).getTime() > Date.now()) {
    return NextResponse.json({ verificadas: 0, fechadas: 0, notificadas: 0, proxima })
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
        const { VELA_APAGOU } = await import("@/app/lib/notification-options")
        const nome = doc.nomePrivado ? "" : ` por ${doc.nome}`
        const result = await sendNotificationToOne(
          doc.notifyEndpoint,
          "Sua vela apagou",
          `A vela que você acendeu${nome} em ${diaEmQueAcendeu(doc.createdAt)} já completou o tempo. Você pode acender outra quando quiser.`,
          "/velas",
          VELA_APAGOU
        )
        if (result.success) notificadas++
      }
    } catch (err) {
      console.error("[cron] falha ao fechar/notificar vela:", doc.id, err)
    }
  }

  return NextResponse.json({ verificadas: docs.length, fechadas, notificadas })
}
