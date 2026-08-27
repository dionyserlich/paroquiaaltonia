import { cache } from "react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { RichText as RichTextBase } from "@payloadcms/richtext-lexical/react"

// Cast: o tipo de retorno do RichText (ReactNode) não bate com o que a
// versão do @types/react instalada aceita como componente JSX.
const RichText: (props: { data: unknown; className?: string }) => any = RichTextBase as any
import Header from "@/components/header"
import BottomNavbar from "@/components/bottom-navbar"
import PageClient from "../../page-client"
import { payloadClient } from "@/app/lib/payload"
import { findBySlugOrLegacyId } from "@/app/lib/find-by-slug"
import { formatarData } from "@/lib/utils"
import type { Noticia } from "@/app/lib/content-types"

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
    .filter((img): img is NonNullable<typeof img> => Boolean(img))

  return (
    <PageClient>
      <main className="flex min-h-screen flex-col bg-[#00143d]">
        <Header />
        <div className="page-no-hero z-20">
          <div className="container mx-auto px-4 py-6">
            <article className="max-w-3xl mx-auto">
              <Link href="/noticias" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4">
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
                <RichText data={noticia.conteudo as any} />
              </div>

              {galeria.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-4 text-yellow-500">Fotos</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {galeria.map((img) => (
                      <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden">
                        {img.url && <Image src={img.url} alt={img.alt || noticia.titulo} fill className="object-cover" />}
                      </div>
                    ))}
                  </div>
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
