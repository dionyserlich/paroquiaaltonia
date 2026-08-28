import Header from "@/components/header"
import BottomNavbar from "@/components/bottom-navbar"
import EventosAbas from "./eventos-abas"
import PageClient from "../page-client"
import { payloadClient } from "@/app/lib/payload"
import type { Evento } from "@/app/lib/content-types"

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

// Sem isso, Next trata esta página como estática (nenhuma API dinâmica é
// chamada aqui) e congela o resultado do payload.find no build — conteúdo
// publicado depois via CMS nunca aparece até o próximo deploy.
export const dynamic = "force-dynamic"

export default async function EventosPage() {
  const payload = await payloadClient()
  const { docs } = await payload.find({
    collection: "eventos",
    sort: "startAt",
    limit: 200,
  })
  const eventos = docs as Evento[]
  const now = Date.now()
  const proximos = eventos.filter((e) => new Date(e.startAt).getTime() >= now)
  const passados = eventos
    .filter((e) => new Date(e.startAt).getTime() < now)
    .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime())

  return (
    <PageClient>
      <main className="flex min-h-screen flex-col bg-parish-bg">
        <Header />
        <h1 className="text-2xl font-bold text-white mb-6 text-center mt-10">Eventos</h1>
        <div className="z-20 page-no-hero">
          <div className="container mx-auto px-4 py-6">
            <EventosAbas proximos={proximos} passados={passados} />
          </div>
        </div>

        <BottomNavbar />
      </main>
    </PageClient>
  )
}
