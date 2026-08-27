import type { Metadata } from "next"
import Header from "@/components/header"
import BottomNavbar from "@/components/bottom-navbar"
import PastoraisContent from "./pastorais-content"
import { payloadClient } from "@/app/lib/payload"

export const metadata: Metadata = {
  title: "Pastorais",
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
  const payload = await payloadClient()
  const { docs } = await payload.find({ collection: "pastorais", sort: "ordem", limit: 50 })

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="page-no-hero p-6">
          <PastoraisContent pastorais={docs as any} />
        </div>
      </main>
      <BottomNavbar />
    </>
  )
}
