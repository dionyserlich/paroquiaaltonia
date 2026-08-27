import type { Metadata } from "next"
import Header from "@/components/header"
import BottomNavbar from "@/components/bottom-navbar"
import DizimoContent from "./dizimo-content"
import { payloadClient } from "@/app/lib/payload"

export const metadata: Metadata = {
  title: "Dízimo",
  description:
    "Adira ao dízimo da Paróquia São Sebastião de Altônia. Contribua mensalmente para o crescimento da nossa comunidade.",
  keywords: ["dízimo", "contribuição mensal", "paróquia", "são sebastião", "altônia"],
  openGraph: {
    title: "Dízimo - Paróquia São Sebastião",
    description: "Adira ao dízimo da Paróquia São Sebastião de Altônia",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Dízimo - Paróquia São Sebastião",
    description: "Adira ao dízimo da Paróquia São Sebastião de Altônia",
  },
}

export default async function DizimoPage() {
  const payload = await payloadClient()
  const dizimo = await payload.findGlobal({ slug: "dizimo" })

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="page-no-hero p-6">
          <DizimoContent conteudo={dizimo.conteudo} chavePix={dizimo.chavePix} />
        </div>
      </main>
      <BottomNavbar />
    </>
  )
}
