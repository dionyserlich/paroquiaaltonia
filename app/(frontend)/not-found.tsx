import Link from "next/link"
import Header from "@/components/header"
import BottomNavbar from "@/components/bottom-navbar"

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col bg-parish-bg">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center page-no-hero">
        <h1 className="text-6xl font-bold text-yellow-500 mb-4">404</h1>
        <p className="text-white text-lg mb-2">Página não encontrada</p>
        <p className="text-gray-300 mb-8">O conteúdo que você procura não existe ou foi removido.</p>
        <Link href="/" className="bg-yellow-500 text-parish-navy font-semibold px-6 py-3 rounded-full">
          Voltar para o início
        </Link>
      </div>
      <BottomNavbar />
    </main>
  )
}
