import type { Metadata } from "next"
import Header from "@/components/header"
import BottomNavbar from "@/components/bottom-navbar"
import PageClient from "../page-client"
import VelasContent from "./velas-content"

export const metadata: Metadata = {
  title: "Acenda uma Vela",
  description: "Acenda uma vela virtual e faça sua oração na Paróquia São Sebastião de Altônia.",
  keywords: ["vela", "oração", "capela virtual", "paróquia", "são sebastião", "altônia"],
  openGraph: {
    title: "Acenda uma Vela - Paróquia São Sebastião",
    description: "Acenda uma vela virtual e faça sua oração na Paróquia São Sebastião de Altônia.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Acenda uma Vela - Paróquia São Sebastião",
    description: "Acenda uma vela virtual e faça sua oração na Paróquia São Sebastião de Altônia.",
  },
}

export default function VelasPage() {
  return (
    <PageClient>
      <Header />
      <main className="min-h-screen">
        <div className="page-no-hero p-6">
          <VelasContent />
        </div>
      </main>
      <BottomNavbar />
    </PageClient>
  )
}
