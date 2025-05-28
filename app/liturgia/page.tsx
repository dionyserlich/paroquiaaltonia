import Header from "@/components/header"
import BottomNavbar from "@/components/bottom-navbar"
import LiturgiaContent from "./liturgia-content"
import PageClient from "../page-client"

export const metadata = {
  title: "Liturgia Diária - Paróquia São Sebastião",
  description: "Confira a liturgia diária com as leituras, evangelho e orações do dia na Paróquia São Sebastião",
  openGraph: {
    title: "Liturgia Diária - Paróquia São Sebastião",
    description: "Confira a liturgia diária com as leituras, evangelho e orações do dia na Paróquia São Sebastião",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Liturgia Diária - Paróquia São Sebastião",
    description: "Confira a liturgia diária com as leituras, evangelho e orações do dia na Paróquia São Sebastião",
  },
}

export default function LiturgiaPage() {
  return (
    <PageClient>
      <main className="flex min-h-screen flex-col bg-[#00143d]">
        <Header />
        <h1 className="text-2xl font-bold text-white mb-6 text-center mt-10">Liturgia Diária</h1>
        <div className="z-20 page-no-hero">
          <div className="container mx-auto px-4 py-6">
            <LiturgiaContent />
          </div>
        </div>

        <BottomNavbar />
      </main>
    </PageClient>
  )
}
