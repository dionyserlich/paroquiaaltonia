import Header from "@/components/header"
import BottomNavbar from "@/components/bottom-navbar"
import NoticiasLista from "./noticias-lista"
import PageClient from "../page-client"

export const metadata = {
  title: "Notícias - Paróquia São Sebastião",
  description: "Confira as últimas notícias da Paróquia São Sebastião",
}

export default function NoticiasPage() {
  return (
    <PageClient>
      <main className="flex min-h-screen flex-col bg-[#00143d]">
        <Header />
        <h1 className="text-2xl font-bold text-white mb-6 text-center mt-10">Notícias</h1>
        <div className="z-20 page-no-hero">
        
          <div className="container mx-auto px-4 py-6">
            
            <NoticiasLista />
          </div>
        </div>

        <BottomNavbar />
      </main>
    </PageClient>
  )
}
