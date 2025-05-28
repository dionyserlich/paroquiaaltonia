import Link from "next/link"
import { ChevronLeft } from 'lucide-react'
import Header from "@/components/header"
import BottomNavbar from "@/components/bottom-navbar"
import EventoDetalhes from "./evento-detalhes"
import PageClient from "../../page-client"
import type { Metadata } from "next"

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/proximos-eventos/${params.id}`, {
      cache: 'no-store'
    })
    
    if (!res.ok) {
      return {
        title: "Evento não encontrado - Paróquia São Sebastião",
        description: "Evento não encontrado na Paróquia São Sebastião",
        robots: {
          index: false,
          follow: false,
        },
      }
    }

    const evento = await res.json()

    return {
      title: `${evento.titulo} - Paróquia São Sebastião`,
      description: evento.descricao || `${evento.titulo} - ${evento.dia} de ${evento.mes} de ${evento.ano} às ${evento.hora}`,
      openGraph: {
        title: `${evento.titulo} - Paróquia São Sebastião`,
        description: evento.descricao || `${evento.titulo} - ${evento.dia} de ${evento.mes} de ${evento.ano} às ${evento.hora}`,
        type: "article",
      },
      twitter: {
        card: "summary",
        title: `${evento.titulo} - Paróquia São Sebastião`,
        description: evento.descricao || `${evento.titulo} - ${evento.dia} de ${evento.mes} de ${evento.ano} às ${evento.hora}`,
      },
    }
  } catch (error) {
    console.error("Erro ao gerar metadata do evento:", error)
    return {
      title: "Evento - Paróquia São Sebastião",
      description: "Evento da Paróquia São Sebastião",
    }
  }
}

// Atualizar a interface Props para o componente
export default function EventoPage({ params }: Props) {
  return (
    <PageClient>
      <main className="flex min-h-screen flex-col bg-[#00143d]">
        <Header />
        
        <div className="page-no-hero z-20">
          <div className="container mx-auto px-4 py-6">
            <Link href="/eventos" className="flex items-center text-white mb-4">
              <ChevronLeft size={20} />
              <span>Voltar para eventos</span>
            </Link>

            <EventoDetalhes id={params.id} />
          </div>
        </div>

        <BottomNavbar />
      </main>
    </PageClient>
  )
}
