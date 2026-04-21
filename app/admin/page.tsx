"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import "@/app/admin/admin.css"

export default function AdminPanel() {
  const router = useRouter()

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <AdminCard title="Missas" description="Gerenciar missas e transmissões ao vivo" link="/admin/missas" />
          <AdminCard title="Eventos" description="Gerenciar próximos eventos" link="/admin/eventos" />
          <AdminCard title="Notícias" description="Gerenciar últimas notícias" link="/admin/noticias" />
          <AdminCard title="Bot Missa ao Vivo" description="Status e execução do bot do YouTube" link="/admin/missa-bot" />
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
