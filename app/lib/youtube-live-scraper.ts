export type LiveVideo = {
  videoId: string
  title: string
  embedUrl: string
}

const LIVE_URL = "https://www.youtube.com/@ParoquiaAlt%C3%B4nia/live"

export async function fetchLiveVideo(): Promise<LiveVideo | null> {
  const res = await fetch(LIVE_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept-Language": "pt-BR,pt;q=0.9",
    },
    cache: "no-store",
    redirect: "follow",
  })
  if (!res.ok) {
    throw new Error(`YouTube respondeu ${res.status}`)
  }
  const html = await res.text()

  const canonMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"\s*\/?>/i)
  const canonical = canonMatch?.[1] ?? ""
  const videoIdMatch = canonical.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
  if (!videoIdMatch) {
    return null
  }
  const videoId = videoIdMatch[1]

  const isLive = /"isLive"\s*:\s*true/.test(html) || /"isLiveBroadcast"\s*:\s*"True"/.test(html)
  if (!isLive) {
    return null
  }

  let title = "Transmissão ao vivo"
  const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i)
  if (ogTitle?.[1]) title = decodeHtmlEntities(ogTitle[1])

  return {
    videoId,
    title,
    embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1`,
  }
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
}
