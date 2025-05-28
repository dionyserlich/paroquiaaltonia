import Header from "@/components/header"
import BottomNavbar from "@/components/bottom-navbar"
import type { Metadata } from "next"
import { getNoticia } from "@/lib/api"
import NoticiaDetalhes from "./noticia-detalhes"
import PageClient from "../../page-client"

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const noticia = await getNoticia(params.id)

  if (!noticia) {
    return {
      title: "Notícia não encontrada - Paróquia São Sebastião",
      description: "Notícia não encontrada na Paróquia São Sebastião",
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  return {
    title: `${noticia.titulo} - Paróquia São Sebastião`,
    description: noticia.resumo || `Leia mais sobre ${noticia.titulo} na Paróquia São Sebastião`,
    openGraph: {
      title: `${noticia.titulo} - Paróquia São Sebastião`,
      description: noticia.resumo || `Leia mais sobre ${noticia.titulo} na Paróquia São Sebastião`,
      images: [noticia.imagem || "/placeholder.svg"],
    },
    twitter: {
      card: "summary_large_image",
      title: `${noticia.titulo} - Paróquia São Sebastião`,
      description: noticia.resumo || `Leia mais sobre ${noticia.titulo} na Paróquia São Sebastião`,
      images: [noticia.imagem || "/placeholder.svg"],
    },
  }
}

export default function NoticiaPage({ params }: Props) {
  return (
    <PageClient>
      <main className="flex min-h-screen flex-col bg-[#00143d]">
        <Header />
        
        <div className="page-no-hero z-20">
          <div className="container mx-auto px-4 py-6">
            <NoticiaDetalhes id={params.id} />
          </div>
        </div>

        <BottomNavbar />
      </main>
    </PageClient>
  )
}
