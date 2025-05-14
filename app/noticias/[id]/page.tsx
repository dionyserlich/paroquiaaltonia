import type { Metadata } from "next"
import NoticiaDetalhes from "./noticia-detalhes"

interface PageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Notícia - Paróquia São Sebastião`,
    description: "Detalhes da notícia da Paróquia São Sebastião",
  }
}

export default function NoticiaPage({ params }: PageProps) {
  return (
    <main className="container mx-auto px-4 py-8">
      <NoticiaDetalhes id={params.id} />
    </main>
  )
}
