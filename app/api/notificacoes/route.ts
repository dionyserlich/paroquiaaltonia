import { NextRequest, NextResponse } from "next/server"
import { listarNotificacoes } from "@/app/lib/notification-log"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

// Histórico exibido no sino. Sem login: o aparelho se identifica pelo
// deviceId gravado no próprio navegador. Isso só decide quais avisos
// INDIVIDUAIS aparecem além dos gerais — não é autenticação, e não expõe
// nada além do que já foi enviado àquele aparelho.
export async function GET(req: NextRequest) {
  try {
    const deviceId = req.nextUrl.searchParams.get("deviceId")
    const endpoint = req.nextUrl.searchParams.get("endpoint")
    const notificacoes = await listarNotificacoes(deviceId, endpoint)
    return NextResponse.json({ notificacoes })
  } catch (err) {
    console.error("Erro ao listar notificações:", err)
    return NextResponse.json({ error: "Falha ao carregar notificações" }, { status: 500 })
  }
}
