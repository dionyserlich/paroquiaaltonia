import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import Header from "@/components/header"
import BottomNavbar from "@/components/bottom-navbar"
import EventoDetalhes from "./evento-detalhes"
import PageClient from "../../page-client"

export default function EventoPage({ params }: { params: { id: string } }) {
  return (
    <PageClient>
      <main className="flex min-h-screen flex-col bg-[#00143d]">
        <Header />

        <div className="relative z-20 pt-16">
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
