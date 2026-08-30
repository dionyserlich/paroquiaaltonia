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

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.paroquiaaltonia.com.br"

// Sem isso, o resultado do payload.findGlobal (contato pro schema.org
// abaixo) fica congelado no build — edições feitas depois via CMS nunca
// apareceriam no dado estruturado até o próximo deploy.
export const dynamic = "force-dynamic"

export default async function Home() {
  const payload = await payloadClient()
  const contato = await payload.findGlobal({ slug: "contact-info" }).catch(() => null)

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
                <EventsList />
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
              <NewsList />
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
