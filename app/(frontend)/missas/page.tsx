import type { Metadata } from "next"
import Header from "@/components/header"
import BottomNavbar from "@/components/bottom-navbar"
import MissasContent from "./missas-content"
import PageClient from "../page-client"
import { payloadClient } from "@/app/lib/payload"
import { consultaCacheada } from "@/app/lib/cache-consulta"

export const metadata: Metadata = {
  title: "Missas",
  alternates: { canonical: "/missas" },
  description:
    "Horários das missas e celebrações anteriores da Paróquia São Sebastião de Altônia. Acompanhe nossa programação litúrgica.",
  keywords: ["missas", "horários", "celebrações", "liturgia", "paróquia", "são sebastião", "altônia"],
  openGraph: {
    title: "Missas - Paróquia São Sebastião",
    description: "Horários das missas e celebrações da Paróquia São Sebastião de Altônia",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Missas - Paróquia São Sebastião",
    description: "Horários das missas e celebrações da Paróquia São Sebastião de Altônia",
  },
}

// Busca no SERVIDOR para os títulos das celebrações existirem no HTML.
async function buscarMissas() {
  try {
    return await consultaCacheada("pag-missas", "missas", 600, async () => {
      const payload = await payloadClient()
      const { docs } = await payload.find({ collection: "missas", sort: "-inicio", limit: 100 })
      return (docs as unknown as { id: string; titulo: string; inicio: string; linkEmbed?: string }[]).map((m) => ({
        id: String(m.id),
        titulo: m.titulo,
        dataTransmissao: m.inicio,
        linkVideo: m.linkEmbed ?? "",
      }))
    })()
  } catch (err) {
    console.error("[missas] banco indisponível:", err)
    return undefined
  }
}

export default async function MissasPage() {
  const inicial = await buscarMissas()

  return (
    <PageClient>
      <Header />
      <main className="min-h-screen">
        <div className="page-no-hero p-6">
          <MissasContent inicial={inicial} />
        </div>
      </main>
      <BottomNavbar />
    </PageClient>
  )
}
