import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import BannerSlider from "@/components/banner-slider"
import EventsList from "@/components/events-list"
import NewsList from "@/components/news-list"
import LiveMassButton from "@/components/live-mass-button"
import QuickLinks from "@/components/quick-links"
import ConhecaParoquia from "@/components/conheca-paroquia"
import BottomNavbar from "@/components/bottom-navbar"
import Header from "@/components/header"
import { JsonLd } from "@/components/json-ld"
import PageClient from "./page-client"
import { payloadClient } from "@/app/lib/payload"
import { consultaCacheada } from "@/app/lib/cache-consulta"
import type { Noticia, Evento } from "@/app/lib/content-types"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.paroquiaaltonia.com.br"

// Dinâmica de propósito, com a CONSULTA cacheada (app/lib/cache-consulta.ts)
// em vez da rota. É o mesmo princípio já aplicado às rotas de API, e por dois
// motivos: nada é congelado no build, e — o que motivou a volta atrás — a
// página deixa de ser gerada durante o build.
//
// Com `revalidate`, o Next pré-renderizava esta página, e cada geração
// inicializa o Payload, que faz introspecção completa do schema. Com o banco
// em São Paulo e a máquina de build da Vercel nos EUA, isso levou o deploy de
// ~2 para ~20 minutos. O ganho de cache continua: quem paga a consulta é o
// primeiro visitante depois de expirar, não o build.
export const dynamic = "force-dynamic"

export default async function Home() {
  // Notícias e eventos buscados AQUI, no servidor, e passados por prop.
  // Antes os componentes buscavam no navegador e o HTML da home saía sem uma
  // única manchete — o Google via ~800 caracteres e reportou "rastreada, mas
  // não indexada". As consultas são cacheadas, então isto não custa banco a
  // mais: uma consulta serve todos os visitantes, em vez de uma por pessoa.
  const [noticias, eventos] = await Promise.all([
    (async () => {
      try {
        return await consultaCacheada("home-noticias", "noticias", 300, async () => {
          const payload = await payloadClient()
          const { docs } = await payload.find({ collection: "noticias", sort: "-data", depth: 1, limit: 5 })
          return docs as unknown as Noticia[]
        })()
      } catch (err) {
        console.error("[home] falha ao buscar notícias:", err)
        return [] as Noticia[]
      }
    })(),
    (async () => {
      try {
        return await consultaCacheada("home-eventos", "eventos", 300, async () => {
          const payload = await payloadClient()
          const { docs } = await payload.find({
            collection: "eventos",
            where: { startAt: { greater_than_equal: new Date().toISOString() } },
            sort: "startAt",
            limit: 4,
          })
          return docs as unknown as Evento[]
        })()
      } catch (err) {
        console.error("[home] falha ao buscar eventos:", err)
        return [] as Evento[]
      }
    })(),
  ])

  // Banco fora do ar não pode derrubar a página: sem este try,
  // payloadClient() estourava e a home caía no error.tsx.
  const contato = await (async () => {
    try {
      return await consultaCacheada("home-contato", "contato", 3600, async () => {
        const payload = await payloadClient()
        return payload.findGlobal({ slug: "contact-info" })
      })()
    } catch (err) {
      console.error("[home] banco indisponível para o dado estruturado:", err)
      return null
    }
  })()

  // Schema.org "Church" — é o que permite o Google mostrar endereço,
  // telefone e redes sociais direto no resultado de busca/Google Maps, sem
  // a pessoa precisar entrar no site. Ver https://schema.org/Church
  const churchJsonLd = {
    "@context": "https://schema.org",
    "@type": "Church",
    name: "Paróquia São Sebastião de Altônia",
    url: baseUrl,
    logo: `${baseUrl}/images/logo-icone.png`,
    image: `${baseUrl}/images/logo-icone.png`,
    ...(contato?.telefone ? { telephone: contato.telefone } : {}),
    ...(contato?.email ? { email: contato.email } : {}),
    ...(contato?.endereco
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: contato.endereco,
            addressLocality: "Altônia",
            addressRegion: "PR",
            addressCountry: "BR",
          },
        }
      : {}),
    sameAs: [
      "https://facebook.com/paroquiaaltonia",
      "https://instagram.com/paroquiaaltonia",
      "https://youtube.com/paroquiaaltonia",
    ],
  }

  return (
    <PageClient>
      <JsonLd data={churchJsonLd} />
      <main className="flex min-h-screen flex-col bg-parish-bg">
        <Header />

        {/* Sem heading de nível 1 antes, o Google tinha menos clareza sobre o
            assunto central da página. Fica invisível de propósito — o
            logo+nome já cumpre esse papel visualmente no Header, isto é só
            pra estrutura/SEO. */}
        <h1 className="sr-only">Paróquia São Sebastião de Altônia</h1>

        {/* Hero Section com efeito Parallax - 100% de largura */}
        <section className="relative w-full h-[60vh] min-h-[400px] hero-parallax">
          {/* Overlay com conteúdo centralizado */}
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white bg-gradiente z-10">
            <div className="max-w-[650px] w-full mx-auto flex flex-col items-center justify-center">
              <Suspense fallback={<div className="p-4 rounded-full bg-yellow-500/80 animate-pulse" />}>
                <LiveMassButton />
              </Suspense>
            </div>
          </div>
        </section>

        {/* Conteúdo que vai rolar por cima da imagem */}
        <div className="relative z-20">
          {/* Banner Slider */}
          <section className="w-full px-4 py-2 mt-[-80px]">
            <Suspense fallback={<div className="h-48 bg-gray-300/20 animate-pulse rounded-xl" />}>
              <BannerSlider />
            </Suspense>
          </section>

          {/* Quick Links */}
          <section className="w-full py-6">
            <div className="fade-quick-links"></div>
            <QuickLinks />
          </section>

          {/* Próximos Eventos */}
          <section className="w-full px-4 py-4">
            <div className="flex items-center mb-4">
              <h2 className="text-white text-xl font-bold">Próximos</h2>
              <span className="text-white ml-1 text-xl">eventos:</span>
            </div>
            <div className="min-h-[200px]">
              {" "}
              {/* Altura mínima para evitar saltos de layout */}
              <Suspense
                fallback={
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-700/50 rounded-lg animate-pulse" />
                    ))}
                  </div>
                }
              >
                <EventsList eventos={eventos} />
              </Suspense>
            </div>
            <div className="mt-4">
              <Link
                href="/eventos"
                className="text-parish-accent-text block w-full bg-yellow-500 text-center py-3 rounded-lg font-medium"
              >
                Ver agenda completa
              </Link>
            </div>
          </section>

          {/* Últimas Notícias */}
          <section className="w-full px-4 py-4">
            <div className="flex items-center mb-4">
              <h2 className="text-white text-xl font-bold">Últimas</h2>
              <span className="text-white ml-1 text-xl">notícias:</span>
            </div>
            <Suspense fallback={<div className="h-64 bg-gray-300/20 animate-pulse rounded-xl" />}>
              <NewsList noticias={noticias} />
            </Suspense>
            <div className="mt-4">
              <Link
                href="/noticias"
                className="text-parish-accent-text block w-full bg-yellow-500 text-center py-3 rounded-lg font-medium"
              >
                Ver mais notícias
              </Link>
            </div>
          </section>

          {/* Conheça a Paróquia */}
          <section className="w-full py-4">
            <ConhecaParoquia />
          </section>

          {/* Footer */}
          <footer className="w-full px-4 py-8 mt-auto text-center text-white/70 text-sm">
            <p>Paróquia São Sebastião de Altônia</p>
            <p>Desenvolvido e mantido voluntariamente por Dionys Erlich – <a href="https://wa.me/5544999625033">@dionyserlich</a></p>
            <div className="mt-4 flex justify-center">
              <Image src="/images/logo-icone.png" alt="Logo São Sebastião" width={60} height={60} />
            </div>
          </footer>
        </div>

        <BottomNavbar />
      </main>
    </PageClient>
  )
}
