import Header from "@/components/header"
import BottomNavbar from "@/components/bottom-navbar"
import LiturgiaContent from "./liturgia-content"
import PageClient from "../page-client"

export const metadata = {
  title: "Liturgia Diária",
  alternates: { canonical: "/liturgia" },
  description: "Confira a liturgia diária com as leituras, evangelho e orações do dia na Paróquia São Sebastião",
  openGraph: {
    title: "Liturgia Diária",
    description: "Confira a liturgia diária com as leituras, evangelho e orações do dia na Paróquia São Sebastião",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Liturgia Diária",
    description: "Confira a liturgia diária com as leituras, evangelho e orações do dia na Paróquia São Sebastião",
  },
}

// Busca a liturgia no SERVIDOR para que as leituras e o evangelho existam
// no HTML. `revalidate` de 1h na chamada: a liturgia do dia não muda, e
// isso evita bater na API externa a cada visita.
async function buscarLiturgia() {
  try {
    const res = await fetch("https://liturgia.up.railway.app/v2/", { next: { revalidate: 3600 } })
    if (!res.ok) return null
    return await res.json()
  } catch (err) {
    console.error("[liturgia] API externa indisponível:", err)
    return null
  }
}

export default async function LiturgiaPage() {
  // Se a API externa falhar, o componente busca sozinho no navegador — a
  // página continua funcionando, só perde o ganho de indexação naquele
  // acesso.
  const inicial = await buscarLiturgia()

  return (
    <PageClient>
      <main className="flex min-h-screen flex-col bg-parish-bg">
        <Header />
        <h1 className="text-2xl font-bold text-white mb-6 text-center mt-10">Liturgia Diária</h1>
        <div className="z-20 page-no-hero">
          <div className="container mx-auto px-4 py-6">
            <LiturgiaContent inicial={inicial} />
          </div>
        </div>

        <BottomNavbar />
      </main>
    </PageClient>
  )
}
