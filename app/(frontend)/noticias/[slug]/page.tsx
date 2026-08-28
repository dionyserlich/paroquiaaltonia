import { cache } from "react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { RichText as RichTextBase } from "@payloadcms/richtext-lexical/react"

// Cast: o tipo de retorno do RichText (ReactNode) não bate com o que a
// versão do @types/react instalada aceita como componente JSX.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RichText: (props: { data: unknown; className?: string }) => any = RichTextBase as any
import Header from "@/components/header"
import BottomNavbar from "@/components/bottom-navbar"
import PhotoLightbox from "@/components/photo-lightbox"
import { JsonLd } from "@/components/json-ld"
import PageClient from "../../page-client"
import { payloadClient } from "@/app/lib/payload"
import { findBySlugOrLegacyId } from "@/app/lib/find-by-slug"
import { formatarData } from "@/lib/utils"
import type { Noticia } from "@/app/lib/content-types"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.paroquiaaltonia.com.br"

type Props = {
  params: Promise<{ slug: string }>
}

const getNoticia = cache(async (slug: string) => {
  const payload = await payloadClient()
  return findBySlugOrLegacyId<Noticia>(payload, "noticias", slug, "/noticias")
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const noticia = await getNoticia(slug)
  const imagem = typeof noticia.imagem === "object" ? noticia.imagem : null

  return {
    title: `${noticia.titulo} - Paróquia São Sebastião`,
    description: noticia.resumo || `Leia mais sobre ${noticia.titulo} na Paróquia São Sebastião`,
    openGraph: {
      title: `${noticia.titulo} - Paróquia São Sebastião`,
      description: noticia.resumo || `Leia mais sobre ${noticia.titulo} na Paróquia São Sebastião`,
      images: [imagem?.url || "/images/logo-icone.png"],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${noticia.titulo} - Paróquia São Sebastião`,
      description: noticia.resumo || `Leia mais sobre ${noticia.titulo} na Paróquia São Sebastião`,
      images: [imagem?.url || "/images/logo-icone.png"],
    },
  }
}

export default async function NoticiaPage({ params }: Props) {
  const { slug } = await params
  const noticia = await getNoticia(slug)
  const imagem = typeof noticia.imagem === "object" ? noticia.imagem : null
  const galeria = (noticia.galeria || [])
    .map((item) => (typeof item.imagem === "object" ? item.imagem : null))
    .filter((img): img is NonNullable<typeof img> & { url: string } => Boolean(img?.url))

  // Schema.org "NewsArticle" — ver https://schema.org/NewsArticle
  const noticiaJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: noticia.titulo,
    datePublished: noticia.data,
    ...(noticia.resumo ? { description: noticia.resumo } : {}),
    image: [imagem?.url || `${baseUrl}/images/logo-icone.png`],
    author: { "@type": "Organization", name: "Paróquia São Sebastião de Altônia" },
    publisher: {
      "@type": "Organization",
      name: "Paróquia São Sebastião de Altônia",
      logo: { "@type": "ImageObject", url: `${baseUrl}/images/logo-icone.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${baseUrl}/noticias/${slug}` },
  }

  return (
    <PageClient>
      <JsonLd data={noticiaJsonLd} />
      <main className="flex min-h-screen flex-col bg-parish-bg">
        <Header />
        <div className="page-no-hero z-20">
          <div className="container mx-auto px-4 py-6">
            <article className="max-w-3xl mx-auto">
              <Link href="/noticias" className="inline-flex items-center text-yellow-500 hover:text-yellow-400 mb-4">
                ← Voltar para notícias
              </Link>

              <h1 className="text-3xl font-bold mb-2 text-white">{noticia.titulo}</h1>
              <p className="text-yellow-500 mb-6">{formatarData(noticia.data)}</p>

              {imagem?.url && (
                <div className="relative w-full h-64 md:h-96 mb-6 rounded-lg overflow-hidden">
                  <Image src={imagem.url} alt={imagem.alt || noticia.titulo} fill className="object-cover" />
                </div>
              )}

              <div className="prose prose-invert max-w-none text-white">
                <RichText data={noticia.conteudo} />
              </div>

              {galeria.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-4 text-yellow-500">Fotos</h2>
                  <PhotoLightbox fotos={galeria} altFallback={noticia.titulo} />
                </div>
              )}
            </article>
          </div>
        </div>
        <BottomNavbar />
      </main>
    </PageClient>
  )
}
