import type { Metadata } from "next"
import Header from "@/components/header"
import BottomNavbar from "@/components/bottom-navbar"
import SobreContent from "./sobre-content"

export const metadata: Metadata = {
  title: "Sobre a Paróquia",
  description:
    "Conheça a história da Paróquia São Sebastião de Altônia, desde sua fundação em 1969 até os dias atuais. Um marco de fé e compromisso comunitário no noroeste do Paraná.",
  keywords: [
    "história",
    "paróquia são sebastião",
    "altônia",
    "fundação",
    "dom elizeu simões mendes",
    "diocese umuarama",
  ],
  openGraph: {
    title: "Sobre a Paróquia - Paróquia São Sebastião",
    description:
      "Conheça a história da Paróquia São Sebastião de Altônia, desde sua fundação em 1969 até os dias atuais.",
    images: ["/images/logo-icone.png"],
  },
  twitter: {
    title: "Sobre a Paróquia - Paróquia São Sebastião",
    description:
      "Conheça a história da Paróquia São Sebastião de Altônia, desde sua fundação em 1969 até os dias atuais.",
    images: ["/images/logo-icone.png"],
  },
}

export default function SobrePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="page-no-hero p-6">
          <SobreContent />
        </div>
      </main>
      <BottomNavbar />
    </>
  )
}
