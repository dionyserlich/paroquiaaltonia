import { Suspense } from "react"
import Header from "@/components/header"
import BottomNavbar from "@/components/bottom-navbar"
import EventoDetalhes from "./evento-detalhes"
import EventoDetalhesSkeleton from "@/components/skeletons/evento-detalhes-skeleton"

export default function EventoPage({ params }: { params: { id: string } }) {
  return (
    <main className="flex min-h-screen flex-col bg-[#00143d]">
      <Header />

      <div className="relative z-20 pt-16">
        <div className="container mx-auto px-4 py-6">
          <Suspense fallback={<EventoDetalhesSkeleton />}>
            <EventoDetalhes id={params.id} />
          </Suspense>
        </div>
      </div>

      <BottomNavbar />
    </main>
  )
}
