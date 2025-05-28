import type { Metadata } from "next"
import Header from "@/components/header"
import BottomNavbar from "@/components/bottom-navbar"
import OfertasContent from "./ofertas-content"

export const metadata: Metadata = {
  title: "Ofertas",
  description:
    "Contribua com ofertas para a Paróquia São Sebastião de Altônia. Ajude a manter nossa comunidade e obras sociais.",
  keywords: ["ofertas", "contribuição", "doação", "paróquia", "são sebastião", "altônia"],
  openGraph: {
    title: "Ofertas - Paróquia São Sebastião",
    description: "Contribua com ofertas para a Paróquia São Sebastião de Altônia",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Ofertas - Paróquia São Sebastião",
    description: "Contribua com ofertas para a Paróquia São Sebastião de Altônia",
  },
}

export default function OfertasPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="page-no-hero p-6">
          <OfertasContent />
        </div>
      </main>
      <BottomNavbar />
    </>
  )
}
