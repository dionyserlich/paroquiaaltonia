import type { Metadata } from "next"
import PageClient from "@/app/page-client"
import NoticiasLista from "./noticias-lista"
import Header from "@/components/header"
import BottomNavbar from "@/components/bottom-navbar"

export const metadata: Metadata = {
  title: "Notícias | Paróquia São Sebastião",
  description: "Fique por dentro das últimas notícias da Paróquia São Sebastião",
}

export default function NoticiasPage() {
  return (
    <PageClient>
      <Header />
      <div className="hero-parallax" />
      <main>
        <div className="relative z-20 px-4 py-6">
          <h1 className="text-2xl font-bold text-center mb-6 text-yellow-500">Notícias da Paróquia</h1>
          <NoticiasLista />
        </div>
      </main>
      <BottomNavbar />
    </PageClient>
  )
}
