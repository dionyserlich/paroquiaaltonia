import { cache } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft, Calendar, MapPin } from "lucide-react"
import { RichText as RichTextBase } from "@payloadcms/richtext-lexical/react"
import Header from "@/components/header"
import BottomNavbar from "@/components/bottom-navbar"
import { JsonLd } from "@/components/json-ld"
import PageClient from "../../page-client"
import { payloadClient } from "@/app/lib/payload"
import { findBySlugOrLegacyId } from "@/app/lib/find-by-slug"
import { formatarData } from "@/lib/utils"
import type { Evento } from "@/app/lib/content-types"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.paroquiaaltonia.com.br"

// Cast: o tipo de retorno do RichText (ReactNode) não bate com o que a
// versão do @types/react instalada aceita como componente JSX.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RichText: (props: { data: unknown; className?: string }) => any = RichTextBase as any

type Props = {
  params: Promise<{ slug: string }>
}

const getEvento = cache(async (slug: string) => {
  const payload = await payloadClient()
  return findBySlugOrLegacyId<Evento>(payload, "eventos", slug, "/eventos")
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const evento = await getEvento(slug)
  const description = evento.descricao || `${evento.titulo} - ${formatarData(evento.startAt)}`

  // Ver comentário equivalente em noticias/[slug]: o sufixo da paróquia vem
  // do template só no `title`; em openGraph/twitter precisa ser explícito.
  const tituloCompartilhado = `${evento.titulo} - Paróquia São Sebastião`

  return {
    title: evento.titulo,
    description,
    alternates: { canonical: `/eventos/${slug}` },
    openGraph: {
      title: tituloCompartilhado,
      description,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: tituloCompartilhado,
      description,
    },
  }
}

export default async function EventoPage({ params }: Props) {
  const { slug } = await params
  const evento = await getEvento(slug)
  const payload = await payloadClient()
  const contato = await payload.findGlobal({ slug: "contact-info" }).catch(() => null)

  // Schema.org "Event" — ver https://schema.org/Event.
  //
  // O local sai do campo `local` do evento; vazio significa "na matriz", que
  // é a grande maioria dos casos. Antes não havia esse campo e TODO evento
  // declarava o endereço da matriz, inclusive as festas de comunidade que
  // acontecem em outro lugar — endereço errado no JSON-LD é endereço errado
  // no resultado do Google.
  //
  // Quando o evento tem local próprio, o `address` vai como texto simples
  // (schema.org aceita Text ou PostalAddress em `address`). Só a matriz sai
  // como PostalAddress, porque só dela sabemos cidade/estado com certeza.
  const localDoEvento = evento.local?.trim()
  const enderecoDoEvento = evento.endereco?.trim()
  const enderecoDaMatriz = contato?.endereco

  const localJsonLd = localDoEvento
    ? {
        "@type": "Place",
        name: localDoEvento,
        ...(enderecoDoEvento ? { address: enderecoDoEvento } : {}),
      }
    : {
        "@type": "Place",
        name: "Paróquia São Sebastião de Altônia",
        ...(enderecoDaMatriz
          ? {
              address: {
                "@type": "PostalAddress",
                streetAddress: enderecoDaMatriz,
                addressLocality: "Altônia",
                addressRegion: "PR",
                addressCountry: "BR",
              },
            }
          : {}),
      }

  const eventoJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: evento.titulo,
    startDate: evento.startAt,
    ...(evento.endAt ? { endDate: evento.endAt } : {}),
    ...(evento.descricao ? { description: evento.descricao } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url: `${baseUrl}/eventos/${slug}`,
    location: localJsonLd,
  }

  return (
    <PageClient>
      <JsonLd data={eventoJsonLd} />
      <main className="flex min-h-screen flex-col bg-parish-bg">
        <Header />

        <div className="page-no-hero z-20">
          <div className="container mx-auto px-4 py-6">
            <Link href="/eventos" className="flex items-center text-white mb-4">
              <ChevronLeft size={20} />
              <span>Voltar para eventos</span>
            </Link>

            <div className="bg-parish-card rounded-lg overflow-hidden">
              <div className="p-6">
                <h1 className="text-2xl font-bold text-white mb-4">{evento.titulo}</h1>

                <div className="flex items-center mb-2 text-yellow-500">
                  <Calendar className="mr-2" size={20} />
                  <span>{formatarData(evento.startAt)}</span>
                </div>

                {/* Só aparece quando o evento acontece fora da matriz — é a
                    informação que mais falta em festa de comunidade. */}
                {localDoEvento && (
                  <div className="flex items-start mb-6 text-yellow-500">
                    <MapPin className="mr-2 shrink-0 mt-1" size={20} />
                    <span>
                      {localDoEvento}
                      {enderecoDoEvento && <span className="block text-white/70 text-sm">{enderecoDoEvento}</span>}
                    </span>
                  </div>
                )}

                {!localDoEvento && <div className="mb-6" />}

                {evento.conteudo ? (
                  <div className="prose prose-invert max-w-none">
                    <RichText data={evento.conteudo} />
                  </div>
                ) : (
                  <p className="text-white">{evento.descricao}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <BottomNavbar />
      </main>
    </PageClient>
  )
}
