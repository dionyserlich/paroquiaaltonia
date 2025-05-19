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
    }
  }

  return {
    title: `${noticia.titulo} - Paróquia São Sebastião`,
    description: noticia.resumo || "Detalhes da notícia da Paróquia São Sebastião",
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
