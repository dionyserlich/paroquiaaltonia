import { NextRequest, NextResponse } from "next/server"
import { payloadClient } from "@/app/lib/payload"
import { fetchLiveVideo } from "@/app/lib/youtube-live-scraper"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

// Usada pelo botão "Verificar transmissão agora" no formulário de Missas.
// A detecção aqui é conveniência para preencher o campo — quem manda é o
// link que a pessoa confirma e salva, não o que o YouTube respondeu. Essa
// inversão é justamente o que faz a missa especial funcionar sem depender
// do cron.
export async function GET(req: NextRequest) {
  try {
    // Consulta externa que custa cota da API do YouTube: restrita a quem
    // está autenticado no CMS.
    const payload = await payloadClient()
    const { user } = await payload.auth({ headers: req.headers })
    if (!user) {
      return NextResponse.json({ error: "não autorizado" }, { status: 401 })
    }

    const live = await fetchLiveVideo()
    if (!live) {
      return NextResponse.json({ encontrada: false })
    }

    return NextResponse.json({
      encontrada: true,
      titulo: live.title,
      linkEmbed: live.embedUrl,
      videoId: live.videoId,
    })
  } catch (err) {
    console.error("[admin] falha ao verificar transmissão:", err)
    return NextResponse.json({ error: "falha ao consultar o YouTube" }, { status: 500 })
  }
}
