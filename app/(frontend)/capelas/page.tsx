import type { Metadata } from "next"
import Header from "@/components/header"
import BottomNavbar from "@/components/bottom-navbar"
import { JsonLd } from "@/components/json-ld"
import PageClient from "../page-client"
import CapelasContent, { type Capela } from "./capelas-content"
import { payloadClient } from "@/app/lib/payload"

export const metadata: Metadata = {
  title: "Capelas e Comunidades",
  description:
    "Conheça as capelas e comunidades da Paróquia São Sebastião de Altônia, espalhadas pela cidade e pela zona rural.",
  keywords: ["capelas", "comunidades", "paróquia", "são sebastião", "altônia"],
  openGraph: {
    title: "Capelas e Comunidades - Paróquia São Sebastião",
    description: "Conheça as capelas e comunidades da Paróquia São Sebastião de Altônia",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Capelas e Comunidades - Paróquia São Sebastião",
    description: "Conheça as capelas e comunidades da Paróquia São Sebastião de Altônia",
  },
}

// Sem isso, Next trata esta página como estática (nenhuma API dinâmica é
// chamada aqui) e congela o resultado do payload.find no build — conteúdo
// publicado depois via CMS nunca aparece até o próximo deploy.
export const dynamic = "force-dynamic"

export default async function CapelasPage() {
  const payload = await payloadClient()
  const { docs } = await payload.find({ collection: "capelas", sort: "nome", limit: 100 })
  const capelas = docs as Capela[]

  // Schema.org "Place" por capela (só as que já têm endereço cadastrado) —
  // ajuda buscas locais tipo "missa capela Santo Antônio Altônia" a
  // encontrarem a capela certa. Ver https://schema.org/Place
  const capelasComEndereco = capelas.filter((c) => c.endereco)
  const capelasJsonLd =
    capelasComEndereco.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: capelasComEndereco.map((capela, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "Place",
              name: capela.nome,
              address: {
                "@type": "PostalAddress",
                streetAddress: capela.endereco,
                addressLocality: "Altônia",
                addressRegion: "PR",
                addressCountry: "BR",
              },
            },
          })),
        }
      : null

  return (
    <PageClient>
      {capelasJsonLd && <JsonLd data={capelasJsonLd} />}
      <Header />
      <main className="min-h-screen">
        <div className="page-no-hero p-6">
          <CapelasContent capelas={capelas} />
        </div>
      </main>
      <BottomNavbar />
    </PageClient>
  )
}
