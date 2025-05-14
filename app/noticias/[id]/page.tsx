import type { Metadata } from "next"
import { getNoticia } from "@/lib/api"
import NoticiaDetalhes from "./noticia-detalhes"

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
    <main className="flex-1 container mx-auto px-4 py-8">
      <NoticiaDetalhes id={params.id} />
    </main>
  )
}
