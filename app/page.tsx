import Image from "next/image"
import { Suspense } from "react"
import BannerSlider from "@/components/banner-slider"
import EventsList from "@/components/events-list"
import NewsList from "@/components/news-list"
import LiveMassButton from "@/components/live-mass-button"
import QuickLinks from "@/components/quick-links"
import BottomNavbar from "@/components/bottom-navbar"
import Header from "@/components/header"
import PageClient from "./page-client"

export default function Home() {
  return (
    <PageClient>
      <main className="flex min-h-screen flex-col bg-[#0a1e42]">
        <Header />

        {/* Hero Section com efeito Parallax */}
        <section className="relative w-full h-[60vh] min-h-[400px] hero-parallax">
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white bg-gradiente z-10">
            <Suspense fallback={<div className="p-4 rounded-full bg-yellow-500/80 animate-pulse" />}>
              <LiveMassButton />
            </Suspense>
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
          <section className="w-full px-4 py-6">
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
              <a href="/eventos" className="block w-full bg-yellow-500 text-center py-3 rounded-lg font-medium">
                Ver agenda completa
              </a>
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
              <a href="/noticias" className="block w-full bg-yellow-500 text-center py-3 rounded-lg font-medium">
                Ver mais notícias
              </a>
            </div>
          </section>

          {/* Footer */}
          <footer className="w-full px-4 py-8 mt-auto text-center text-white/70 text-sm">
            <p>Paróquia São Sebastião de Altônia</p>
            <p>Site mantido por Dionys Erlich</p>
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
