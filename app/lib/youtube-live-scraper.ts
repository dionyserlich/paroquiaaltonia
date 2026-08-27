// Detecção de live via YouTube Data API v3 (search.list), não mais scraping
// de HTML — contrato estável, não quebra quando o YouTube muda o layout do
// site. Precisa de YOUTUBE_API_KEY e YOUTUBE_CHANNEL_ID (o id real do canal,
// não o @handle — obtido uma vez via channels.list(forHandle=...) ou pela
// página "Sobre" do canal no YouTube).
//
// Cota: search.list custa 100 unidades por chamada; cota gratuita padrão é
// 10.000/dia (100 chamadas/dia). O cron só chama isto dentro da janela de
// missa (30 min antes a 90 min depois, a cada 5 min) — média de ~48
// chamadas/dia, dentro da cota com folga.
export type LiveVideo = {
  videoId: string
  title: string
  embedUrl: string
}

export async function fetchLiveVideo(): Promise<LiveVideo | null> {
  const apiKey = process.env.YOUTUBE_API_KEY
  const channelId = process.env.YOUTUBE_CHANNEL_ID
  if (!apiKey || !channelId) {
    throw new Error("YOUTUBE_API_KEY ou YOUTUBE_CHANNEL_ID não configurados")
  }

  const url = new URL("https://www.googleapis.com/youtube/v3/search")
  url.searchParams.set("part", "snippet")
  url.searchParams.set("channelId", channelId)
  url.searchParams.set("eventType", "live")
  url.searchParams.set("type", "video")
  url.searchParams.set("key", apiKey)

  const res = await fetch(url.toString(), { cache: "no-store" })

  if (res.status === 403) {
    const body = await res.text().catch(() => "")
    if (body.includes("quotaExceeded")) {
      throw new Error("YouTube Data API: cota diária excedida (quotaExceeded)")
    }
    throw new Error(`YouTube Data API respondeu 403: ${body.slice(0, 200)}`)
  }
  if (!res.ok) {
    throw new Error(`YouTube Data API respondeu ${res.status}`)
  }

  const data = (await res.json()) as {
    items?: { id?: { videoId?: string }; snippet?: { title?: string } }[]
  }

  const item = data.items?.[0]
  const videoId = item?.id?.videoId
  if (!videoId) return null

  return {
    videoId,
    title: item?.snippet?.title || "Transmissão ao vivo",
    embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1`,
  }
}
