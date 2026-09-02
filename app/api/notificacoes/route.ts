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

    // Timestamp em milissegundos da primeira visita deste navegador. Valor
    // ausente ou inválido vira null — aí vale só a janela padrão.
    const desdeParam = Number(req.nextUrl.searchParams.get("desde"))
    const desde = Number.isFinite(desdeParam) && desdeParam > 0 ? new Date(desdeParam) : null

    const notificacoes = await listarNotificacoes(deviceId, endpoint, desde)
    // A resposta varia por aparelho (traz os avisos individuais), então não
    // pode ser guardada por cache compartilhado — o padrão do Next aqui era
    // "public", que permitiria um intermediário servir a resposta de um
    // aparelho para outro.
    return NextResponse.json(
      { notificacoes },
      { headers: { "Cache-Control": "no-store, private" } }
    )
  } catch (err) {
    console.error("Erro ao listar notificações:", err)
    return NextResponse.json({ error: "Falha ao carregar notificações" }, { status: 500 })
  }
}
