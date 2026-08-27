"use client"

import { useEffect } from "react"
import Link from "next/link"
import Header from "@/components/header"
import BottomNavbar from "@/components/bottom-navbar"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-screen flex-col bg-[#00143d]">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center page-no-hero">
        <h1 className="text-4xl font-bold text-yellow-500 mb-4">Algo deu errado</h1>
        <p className="text-gray-300 mb-8">Ocorreu um erro inesperado. Tente novamente em instantes.</p>
        <div className="flex gap-4">
          <button
            onClick={() => reset()}
            className="bg-yellow-500 text-[#0a1e42] font-semibold px-6 py-3 rounded-full"
          >
            Tentar novamente
          </button>
          <Link href="/" className="border border-yellow-500 text-yellow-500 font-semibold px-6 py-3 rounded-full">
            Voltar para o início
          </Link>
        </div>
      </div>
      <BottomNavbar />
    </main>
  )
}
