import Header from "@/components/header"
import BottomNavbar from "@/components/bottom-navbar"
import EventosAbas from "./eventos-abas"
import PageClient from "../page-client"

export const metadata = {
  title: "Eventos - Paróquia São Sebastião",
  description: "Confira os próximos eventos e atividades da Paróquia São Sebastião de Altônia",
  openGraph: {
    title: "Eventos - Paróquia São Sebastião",
    description: "Confira os próximos eventos e atividades da Paróquia São Sebastião de Altônia",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Eventos - Paróquia São Sebastião",
    description: "Confira os próximos eventos e atividades da Paróquia São Sebastião de Altônia",
  },
}

export default function EventosPage() {
  return (
    <PageClient>
      <main className="flex min-h-screen flex-col bg-[#00143d]">
        <Header />
        <h1 className="text-2xl font-bold text-white mb-6 text-center mt-10">Eventos</h1>
        <div className="z-20 page-no-hero">
        
          <div className="container mx-auto px-4 py-6">
            
            <EventosAbas />
          </div>
        </div>

        <BottomNavbar />
      </main>
    </PageClient>
  )
}
