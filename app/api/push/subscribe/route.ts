import { NextRequest, NextResponse } from "next/server"
import { isValidSubscription, upsertPushSubscription } from "@/app/lib/push-subscriptions"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

// Existe pro service worker (public/sw.js) conseguir regravar a inscrição
// quando o navegador a substitui sozinho (evento pushsubscriptionchange) —
// um service worker não consegue chamar server actions, só HTTP. A página
// continua usando a server action `subscribe` de app/actions.ts; as duas
// caem na mesma função de gravação.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!isValidSubscription(body)) {
      return NextResponse.json({ error: "Inscrição inválida" }, { status: 400 })
    }
    await upsertPushSubscription(body)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Erro ao gravar inscrição push:", err)
    return NextResponse.json({ error: "Falha ao gravar inscrição" }, { status: 500 })
  }
}
