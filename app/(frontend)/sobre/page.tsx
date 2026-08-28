import type { Metadata } from "next"
import Header from "@/components/header"
import BottomNavbar from "@/components/bottom-navbar"
import SobreContent from "./sobre-content"
import PageClient from "../page-client"
import { payloadClient } from "@/app/lib/payload"

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

// Sem isso, Next trata esta página como estática (nenhuma API dinâmica é
// chamada aqui) e congela o resultado dos payload.findGlobal no build —
// edições feitas depois via CMS nunca aparecem até o próximo deploy.
export const dynamic = "force-dynamic"

export default async function SobrePage() {
  const payload = await payloadClient()
  const [sobre, contactInfo] = await Promise.all([
    payload.findGlobal({ slug: "sobre" }),
    payload.findGlobal({ slug: "contact-info" }),
  ])

  return (
    <PageClient>
      <Header />
      <main className="min-h-screen">
        <div className="page-no-hero p-6">
          <SobreContent
            introducao={sobre.introducao}
            timeline={(sobre.timeline || []) as { titulo: string; badge: string; texto: string }[]}
            legado={sobre.legado}
            whatsapp={contactInfo.whatsapp}
          />
        </div>
      </main>
      <BottomNavbar />
    </PageClient>
  )
}
