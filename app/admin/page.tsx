"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useState, useEffect } from "react"

export default function AdminPanel() {
  const router = useRouter()
  const [isConfigured, setIsConfigured] = useState(true)

  useEffect(() => {
    async function checkConfig() {
      try {
        const res = await fetch("/api/admin/config/status")
        const data = await res.json()
        setIsConfigured(data.configured)
      } catch (error) {
        console.error("Erro ao verificar configuração:", error)
      }
    }

    checkConfig()
  }, [])

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      })
      router.push("/admin/login")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-[#0a1e42] text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Image src="/images/logo-icone.png" alt="Paróquia São Sebastião" width={40} height={40} />
            <h1 className="ml-2 text-xl font-bold">Painel Administrativo</h1>
          </div>
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
            Sair
          </button>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {!isConfigured && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
            <p className="font-bold">Atenção!</p>
            <p>
              A integração com o GitHub não está configurada. Isso é necessário para que as alterações feitas no painel
              sejam salvas.{" "}
              <Link href="/admin/configuracao" className="text-blue-600 hover:underline">
                Clique aqui para configurar
              </Link>
              .
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <AdminCard title="Missas" description="Gerenciar missas e transmissões ao vivo" link="/admin/missas" />
          <AdminCard title="Banners" description="Gerenciar banners da página inicial" link="/admin/banners" />
          <AdminCard title="Eventos" description="Gerenciar próximos eventos" link="/admin/eventos" />
          <AdminCard title="Notícias" description="Gerenciar últimas notícias" link="/admin/noticias" />
          <AdminCard
            title="Configuração do GitHub"
            description="Configurar integração com o GitHub"
            link="/admin/configuracao"
          />
        </div>
      </main>
    </div>
  )
}

function AdminCard({ title, description, link }: { title: string; description: string; link: string }) {
  return (
    <Link href={link} className="block">
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
    </Link>
  )
}
