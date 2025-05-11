import { Suspense } from "react"
import Header from "@/components/header"
import BottomNavbar from "@/components/bottom-navbar"
import EventosLista from "./eventos-lista"

export default function EventosPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#00143d]">
      <Header />

      <div className="relative z-20 pt-16">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-white mb-6">Próximos Eventos</h1>

          <Suspense fallback={<div className="h-64 bg-gray-700/50 rounded-lg animate-pulse" />}>
            <EventosLista />
          </Suspense>
        </div>
      </div>

      <BottomNavbar />
    </main>
  )
}
