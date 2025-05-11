import { Suspense } from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import Header from "@/components/header"
import BottomNavbar from "@/components/bottom-navbar"
import EventoDetalhes from "./evento-detalhes"

export default function EventoPage({ params }: { params: { id: string } }) {
  return (
    <main className="flex min-h-screen flex-col bg-[#00143d]">
      <Header />

      <div className="relative z-20 pt-16">
        <div className="container mx-auto px-4 py-6">
          <Link href="/eventos" className="flex items-center text-white mb-4">
            <ChevronLeft size={20} />
            <span>Voltar para eventos</span>
          </Link>

          <Suspense fallback={<div className="h-64 bg-gray-700/50 rounded-lg animate-pulse" />}>
            <EventoDetalhes id={params.id} />
          </Suspense>
        </div>
      </div>

      <BottomNavbar />
    </main>
  )
}
