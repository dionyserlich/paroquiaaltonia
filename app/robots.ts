import type { MetadataRoute } from "next"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.paroquiaaltonia.com.br"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      // /payload-api/media/ precisa passar mesmo com /payload-api bloqueado:
      // é por ali que saem TODAS as imagens de notícia e evento. Bloqueadas,
      // elas não entram no Google Imagens nem aparecem como miniatura no
      // resultado de busca — e a regra mais específica é a que vale.
      allow: ["/", "/payload-api/media/"],
      disallow: ["/cms", "/api", "/payload-api"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
