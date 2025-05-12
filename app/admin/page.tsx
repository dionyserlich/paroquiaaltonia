"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useState, useEffect } from "react"
import "@/app/admin/admin.css"

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
    <div className="admin-page">
      <header className="admin-header">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Image src="/images/logo-icone.png" alt="Paróquia São Sebastião" width={40} height={40} />
            <h1 className="ml-2 text-xl font-bold">Painel Administrativo</h1>
          </div>
          <button onClick={handleLogout} className="admin-btn admin-btn-danger">
            Sair
          </button>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {!isConfigured && (
          <div className="admin-alert admin-alert-warning">
            <p className="font-bold">Atenção!</p>
            <p>
              A integração com o GitHub não está configurada. Isso é necessário para que as alterações feitas no painel
              sejam salvas.{" "}
              <Link href="/admin/configuracao" className="admin-link font-medium">
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
          <AdminCard
            title="Status de Deploy da Vercel"
            description="Visualizar status dos deploys na Vercel"
            link="/admin/vercel-status"
          />
        </div>
      </main>
    </div>
  )
}

function AdminCard({ title, description, link }: { title: string; description: string; link: string }) {
  return (
    <Link href={link} className="block">
      <div className="admin-card hover:shadow-md transition-shadow">
        <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
    </Link>
  )
}
