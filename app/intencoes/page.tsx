import type { Metadata } from "next"
import Header from "@/components/header"
import BottomNavbar from "@/components/bottom-navbar"
import IntencoesContent from "./intencoes-content"

export const metadata: Metadata = {
  title: "Intenções de Missa",
  description:
    "Envie suas intenções para as missas da Paróquia São Sebastião de Altônia. Aniversários, ação de graças, enfermos e muito mais.",
  keywords: ["intenções", "missa", "oração", "paróquia", "são sebastião", "altônia"],
  openGraph: {
    title: "Intenções de Missa - Paróquia São Sebastião",
    description: "Envie suas intenções para as missas da Paróquia São Sebastião de Altônia",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Intenções de Missa - Paróquia São Sebastião",
    description: "Envie suas intenções para as missas da Paróquia São Sebastião de Altônia",
  },
}

export default function IntencoesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="page-no-hero p-6">
          <IntencoesContent />
        </div>
      </main>
      <BottomNavbar />
    </>
  )
}
