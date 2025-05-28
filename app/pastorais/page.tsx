import type { Metadata } from "next"
import Header from "@/components/header"
import BottomNavbar from "@/components/bottom-navbar"
import PastoraisContent from "./pastorais-content"

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

export default function PastoraisPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="page-no-hero p-6">
          <PastoraisContent />
        </div>
      </main>
      <BottomNavbar />
    </>
  )
}
