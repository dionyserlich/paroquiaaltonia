import type { MetadataRoute } from "next"
import { payloadClient } from "@/app/lib/payload"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.paroquiaaltonia.com.br"

// Sem isso, o Next congelaria o sitemap no momento do build (mesmo problema
// corrigido nas páginas de listagem) — notícias/eventos novos não apareceriam
// até o próximo deploy. Revalidate em vez de force-dynamic: buscadores não
// precisam de um sitemap atualizado a cada request.
export const revalidate = 3600

const STATIC_ROUTES = [
  "",
  "/noticias",
  "/eventos",
  "/horarios",
  "/sobre",
  "/dizimo",
  "/ofertas",
  "/pastorais",
  "/missas",
  "/intencoes",
  "/liturgia",
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
  }))

  // Se o banco falhar, devolve só as páginas fixas em vez de estourar. Duas
  // razões já observadas na prática: o Search Console acusou "não foi
  // possível ler o sitemap" numa instabilidade momentânea, e — pior — como
  // esta rota é pré-renderizada, o erro derrubava o BUILD inteiro. Ou seja,
  // banco fora do ar impedia até de publicar a correção. Um sitemap parcial
  // é muito melhor que nenhum.
  try {
    const payload = await payloadClient()
    const [{ docs: noticias }, { docs: eventos }] = await Promise.all([
      payload.find({ collection: "noticias", where: { slug: { exists: true } }, limit: 1000, depth: 0 }),
      payload.find({ collection: "eventos", where: { slug: { exists: true } }, limit: 1000, depth: 0 }),
    ])

    const noticiaEntries: MetadataRoute.Sitemap = noticias.map((n) => ({
      url: `${baseUrl}/noticias/${n.slug}`,
      lastModified: n.updatedAt ? new Date(n.updatedAt) : undefined,
    }))

    const eventoEntries: MetadataRoute.Sitemap = eventos.map((e) => ({
      url: `${baseUrl}/eventos/${e.slug}`,
      lastModified: e.updatedAt ? new Date(e.updatedAt) : undefined,
    }))

    return [...staticEntries, ...noticiaEntries, ...eventoEntries]
  } catch (err) {
    console.error("[sitemap] banco indisponível, devolvendo só as páginas fixas:", err)
    return staticEntries
  }
}
