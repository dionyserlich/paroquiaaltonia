import type { Metadata } from "next"
import { getNoticia } from "@/lib/api"
import NoticiaDetalhes from "./noticia-detalhes"
import PageClient from "@/app/page-client"
import Header from "@/components/header"
import BottomNavbar from "@/components/bottom-navbar"

interface PageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const noticia = await getNoticia(params.id)

  if (!noticia) {
    return {
      title: "Notícia não encontrada | Paróquia São Sebastião",
    }
  }

  return {
    title: `${noticia.titulo} | Paróquia São Sebastião`,
    description: noticia.resumo,
  }
}

export default function NoticiaPage({ params }: PageProps) {
  return (
    <PageClient>
      <Header />
      <div className="hero-parallax" />
      <main>
        <div className="relative z-20 px-4 py-6">
          <NoticiaDetalhes id={params.id} />
        </div>
      </main>
      <BottomNavbar />
    </PageClient>
  )
}
