import { Suspense } from "react"
import Header from "@/components/header"
import BottomNavbar from "@/components/bottom-navbar"
import EventosAbas from "./eventos-abas"
import EventsSkeleton from "@/components/skeletons/events-skeleton"

export default function EventosPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#00143d]">
      <Header />

      <div className="relative z-20 pt-16">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-white mb-6">Eventos</h1>

          <Suspense
            fallback={
              <div className="space-y-4">
                <EventsSkeleton />
                <EventsSkeleton />
              </div>
            }
          >
            <EventosAbas />
          </Suspense>
        </div>
      </div>

      <BottomNavbar />
    </main>
  )
}
