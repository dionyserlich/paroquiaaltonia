import type { Metadata } from "next"
import Header from "@/components/header"
import ConteudoIndisponivel from "@/components/conteudo-indisponivel"
import BottomNavbar from "@/components/bottom-navbar"
import PastoraisContent, { type Pastoral } from "./pastorais-content"
import PageClient from "../page-client"
import { payloadClient } from "@/app/lib/payload"

export const metadata: Metadata = {
  title: "Pastorais",
  alternates: { canonical: "/pastorais" },
  description:
    "Conheça as pastorais da Paróquia São Sebastião de Altônia. Pastoral da Comunicação, Família, Sobriedade e muito mais.",
  keywords: ["pastorais", "grupos", "comunidade", "paróquia", "são sebastião", "altônia"],
  openGraph: {
    title: "Pastorais - Paróquia São Sebastião",
    description: "Conheça as pastorais da Paróquia São Sebastião de Altônia",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Pastorais - Paróquia São Sebastião",
    description: "Conheça as pastorais da Paróquia São Sebastião de Altônia",
  },
}

// Sem isso, Next trata esta página como estática (nenhuma API dinâmica é
// chamada aqui) e congela o resultado do payload.find no build — conteúdo
// publicado depois via CMS nunca aparece até o próximo deploy.
export const dynamic = "force-dynamic"

export default async function PastoraisPage() {
  // Busca isolada num IIFE com catch: o JSX precisa ficar FORA do
  // try, porque React só renderiza depois e um try/catch em volta do
  // return não capturaria erro nenhum de renderização.
  const dados = await (async () => {
    try {
      const payload = await payloadClient()
      const { docs } = await payload.find({ collection: "pastorais", sort: "ordem", limit: 50 })
      return { ok: true as const, docs }
    } catch (err) {
      console.error("[pastorais] banco indisponível:", err)
      return { ok: false as const }
    }
  })()
  if (!dados.ok) return <ConteudoIndisponivel titulo="Pastorais" />
  const { docs } = dados

  return (
    <PageClient>
      <Header />
      <main className="min-h-screen">
        <div className="page-no-hero p-6">
          <PastoraisContent pastorais={docs as Pastoral[]} />
        </div>
      </main>
      <BottomNavbar />
    </PageClient>
  )
}
