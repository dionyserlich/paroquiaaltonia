import type { Metadata } from "next"
import Header from "@/components/header"
import ConteudoIndisponivel from "@/components/conteudo-indisponivel"
import BottomNavbar from "@/components/bottom-navbar"
import DizimoContent from "./dizimo-content"
import PageClient from "../page-client"
import { payloadClient } from "@/app/lib/payload"

export const metadata: Metadata = {
  title: "Dízimo",
  alternates: { canonical: "/dizimo" },
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

// Sem isso, Next trata esta página como estática (nenhuma API dinâmica é
// chamada aqui) e congela o resultado do payload.findGlobal no build —
// edições feitas depois via CMS nunca aparecem até o próximo deploy.
export const dynamic = "force-dynamic"

export default async function DizimoPage() {
  // Busca isolada num IIFE com catch: o JSX precisa ficar FORA do
  // try, porque React só renderiza depois e um try/catch em volta do
  // return não capturaria erro nenhum de renderização.
  const dados = await (async () => {
    try {
      const payload = await payloadClient()
      return { ok: true as const, dizimo: await payload.findGlobal({ slug: "dizimo" }) }
    } catch (err) {
      console.error("[dizimo] banco indisponível:", err)
      return { ok: false as const }
    }
  })()
  if (!dados.ok) return <ConteudoIndisponivel titulo="Dízimo" />
  const dizimo = dados.dizimo

  return (
    <PageClient>
      <Header />
      <main className="min-h-screen">
        <div className="page-no-hero p-6">
          <DizimoContent conteudo={dizimo.conteudo} chavePix={dizimo.chavePix} />
        </div>
      </main>
      <BottomNavbar />
    </PageClient>
  )
}
