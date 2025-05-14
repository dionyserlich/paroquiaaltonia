import Header from "@/components/header"
import BottomNavbar from "@/components/bottom-navbar"
import EventosAbas from "./eventos-abas"
import PageClient from "../page-client"

export default function EventosPage() {
  return (
    <PageClient>
      <main className="flex min-h-screen flex-col bg-[#00143d]">
        <Header />

        <div className="relative z-20 pt-16">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-white mb-6">Eventos</h1>
            <EventosAbas />
          </div>
        </div>

        <BottomNavbar />
      </main>
    </PageClient>
  )
}
