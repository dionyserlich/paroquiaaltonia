import type { Metadata } from "next"
import Header from "@/components/header"
import BottomNavbar from "@/components/bottom-navbar"
import MissasContent from "./missas-content"

export const metadata: Metadata = {
  title: "Missas",
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

export default function MissasPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="page-no-hero p-6">
          <MissasContent />
        </div>
      </main>
      <BottomNavbar />
    </>
  )
}
