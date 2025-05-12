"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import VercelDeployStatus from "@/components/vercel-deploy-status"
import "@/app/admin/admin.css"

export default function VercelStatusPage() {
  const [isConfigured, setIsConfigured] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkConfig() {
      try {
        setLoading(true)
        const res = await fetch("/api/admin/vercel-config")
        const data = await res.json()

        // Verificar se temos todas as informações necessárias
        const hasProjectId = !!data.projectId
        const hasTeamId = !!data.teamId

        console.log("Configuração da Vercel:", {
          projectId: hasProjectId ? "Configurado" : "Não configurado",
          teamId: hasTeamId ? "Configurado" : "Não configurado",
        })

        setIsConfigured(hasProjectId)
      } catch (error) {
        console.error("Erro ao verificar configuração da Vercel:", error)
      } finally {
        setLoading(false)
      }
    }

    checkConfig()
  }, [])

  if (loading) {
    return (
      <div className="admin-page">
        <header className="admin-header">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">Status de Deploy da Vercel</h1>
            <Link href="/admin" className="admin-btn admin-btn-primary">
              Voltar
            </Link>
          </div>
        </header>

        <main className="container mx-auto p-4">
          <div className="admin-card">
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
              <span className="ml-2 text-gray-600">Carregando...</span>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!isConfigured) {
    return (
      <div className="admin-page">
        <header className="admin-header">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">Status de Deploy da Vercel</h1>
            <Link href="/admin" className="admin-btn admin-btn-primary">
              Voltar
            </Link>
          </div>
        </header>

        <main className="container mx-auto p-4">
          <div className="admin-card">
            <div className="admin-alert admin-alert-warning">
              <h2 className="text-lg font-semibold mb-2">Configuração necessária</h2>
              <p className="mb-4">
                Para visualizar o status dos deploys da Vercel, é necessário configurar as credenciais da Vercel.
              </p>
              <Link href="/admin/vercel-config" className="admin-btn admin-btn-primary">
                Configurar Vercel
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Status de Deploy da Vercel</h1>
          <div className="space-x-2">
            <Link href="/admin/vercel-config" className="admin-btn admin-btn-secondary">
              Configurações
            </Link>
            <Link href="/admin" className="admin-btn admin-btn-primary">
              Voltar
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="admin-card">
          <h2 className="text-xl font-bold mb-4">Status dos Deploys</h2>

          <VercelDeployStatus showRecent={true} />

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Informações</h3>
            <p className="text-gray-700 mb-4">
              Esta página mostra o status dos deploys mais recentes do seu projeto na Vercel. Os deploys são atualizados
              automaticamente quando você faz alterações no GitHub.
            </p>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Dicas</h4>
              <ul className="list-disc list-inside text-blue-700 space-y-1 text-sm">
                <li>Os deploys são iniciados automaticamente quando você faz um commit no GitHub.</li>
                <li>
                  Você pode visualizar mais detalhes sobre um deploy clicando no link do deploy no painel da Vercel.
                </li>
                <li>Se um deploy falhar, verifique os logs no painel da Vercel para identificar o problema.</li>
              </ul>
            </div>

            <div className="mt-4 text-right">
              <Link href="/api/admin/vercel-diagnostico" target="_blank" className="admin-link text-sm">
                Executar diagnóstico da API da Vercel
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
