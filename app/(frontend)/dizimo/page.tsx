import type { Metadata } from "next"
import Header from "@/components/header"
import BottomNavbar from "@/components/bottom-navbar"
import DizimoContent from "./dizimo-content"

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

export default function DizimoPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="page-no-hero p-6">
          <DizimoContent />
        </div>
      </main>
      <BottomNavbar />
    </>
  )
}
