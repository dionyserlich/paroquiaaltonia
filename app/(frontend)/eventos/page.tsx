import Header from "@/components/header"
import BottomNavbar from "@/components/bottom-navbar"
import EventosAbas from "./eventos-abas"
import PageClient from "../page-client"
import { payloadClient } from "@/app/lib/payload"
import { consultaCacheada } from "@/app/lib/cache-consulta"
import type { Evento } from "@/app/lib/content-types"

export const metadata = {
  title: "Eventos",
  alternates: { canonical: "/eventos" },
  description: "Confira os próximos eventos e atividades da Paróquia São Sebastião de Altônia",
  openGraph: {
    title: "Eventos",
    description: "Confira os próximos eventos e atividades da Paróquia São Sebastião de Altônia",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Eventos",
    description: "Confira os próximos eventos e atividades da Paróquia São Sebastião de Altônia",
  },
}

// Dinâmica com a CONSULTA cacheada, não a rota — mesmo motivo da home
// (ver app/(frontend)/page.tsx): com `revalidate` esta página era gerada
// durante o build, e cada geração inicializa o Payload com introspecção
// completa do schema contra um banco em outro continente.
export const dynamic = "force-dynamic"

export default async function EventosPage() {
  // Banco fora do ar não pode derrubar a página inteira no error.tsx:
  // melhor mostrar a casca com o estado vazio, que a página já sabe
  // renderizar, do que a tela de "Algo deu errado".
  const { docs } = await (async () => {
    try {
      return await consultaCacheada("pag-eventos", "eventos", 300, async () => {
        const payload = await payloadClient()
        return payload.find({ collection: "eventos", sort: "startAt", limit: 200 })
      })()
    } catch (err) {
      console.error("[eventos] banco indisponível:", err)
      return { docs: [] }
    }
  })()
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
