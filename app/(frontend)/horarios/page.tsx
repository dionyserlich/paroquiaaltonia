import Header from "@/components/header"
import BottomNavbar from "@/components/bottom-navbar"
import HorariosContent from "./horarios-content"
import PageClient from "../page-client"

export const metadata = {
  title: "Horários - Paróquia São Sebastião",
  description:
    "Confira os horários das missas, atendimento da secretaria, confissões e contatos da Paróquia São Sebastião de Altônia",
  openGraph: {
    title: "Horários - Paróquia São Sebastião",
    description:
      "Confira os horários das missas, atendimento da secretaria, confissões e contatos da Paróquia São Sebastião de Altônia",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Horários - Paróquia São Sebastião",
    description:
      "Confira os horários das missas, atendimento da secretaria, confissões e contatos da Paróquia São Sebastião de Altônia",
  },
}

export default function HorariosPage() {
  return (
    <PageClient>
      <main className="flex min-h-screen flex-col bg-[#00143d]">
        <Header />
        <h1 className="text-2xl font-bold text-white mb-6 text-center mt-10">Horários</h1>
        <div className="z-20 page-no-hero">
          <div className="container mx-auto px-4 py-6">
            <HorariosContent />
          </div>
        </div>

        <BottomNavbar />
      </main>
    </PageClient>
  )
}
