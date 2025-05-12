"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import "@/app/admin/admin.css"

export default function ConfiguracaoVercel() {
  const [config, setConfig] = useState({
    token: "",
    teamId: "",
    projectId: "",
  })
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("/api/admin/vercel-config")
        if (res.ok) {
          const data = await res.json()
          setConfig({
            token: "", // Não exibir o token por segurança
            teamId: data.teamId || "",
            projectId: data.projectId || "",
          })
        }
      } catch (error) {
        console.error("Erro ao carregar configuração:", error)
      }
    }

    loadConfig()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")
    setMessage("")

    try {
      const res = await fetch("/api/admin/vercel-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      })

      const data = await res.json()

      if (res.ok) {
        setStatus("success")
        setMessage("Configuração salva com sucesso!")
      } else {
        setStatus("error")
        setMessage(data.error || "Erro ao salvar configuração")
      }
    } catch (error: any) {
      setStatus("error")
      setMessage(`Erro ao salvar configuração: ${error.message || "Erro desconhecido"}`)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setConfig((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Configuração da Vercel</h1>
          <Link href="/admin" className="admin-btn admin-btn-primary">
            Voltar
          </Link>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="admin-card">
          <p className="mb-4 text-gray-700">
            Configure as credenciais da Vercel para monitorar o status dos deploys diretamente no painel administrativo.
          </p>

          <div className="mb-6 admin-alert admin-alert-warning">
            <h2 className="text-lg font-semibold mb-2">Como obter um token da Vercel</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Acesse{" "}
                <a
                  href="https://vercel.com/account/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-link"
                >
                  https://vercel.com/account/tokens
                </a>
              </li>
              <li>Clique em "Create" para criar um novo token</li>
              <li>Dê um nome ao token (ex: "Paróquia São Sebastião")</li>
              <li>Escolha um período de expiração adequado</li>
              <li>Clique em "Create Token" e copie o token gerado</li>
              <li>Cole o token no campo abaixo</li>
            </ol>

            <div className="mt-4 p-2 bg-blue-50 border-l-4 border-blue-400 text-blue-800">
              <p className="font-semibold">Como obter o ID do projeto e da equipe:</p>
              <p>
                O ID do projeto pode ser encontrado nas configurações do projeto na Vercel. O ID da equipe é opcional e
                só é necessário se o projeto estiver em uma equipe.
              </p>
            </div>
          </div>

          {status === "success" && <div className="admin-alert admin-alert-success">{message}</div>}

          {status === "error" && <div className="admin-alert admin-alert-error">{message}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="token" className="admin-label">
                Token de Acesso da Vercel
              </label>
              <input
                type="password"
                id="token"
                name="token"
                value={config.token}
                onChange={handleChange}
                className="admin-input"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Este token será usado para autenticar as requisições à API da Vercel.
              </p>
            </div>

            <div className="mb-4">
              <label htmlFor="projectId" className="admin-label">
                ID do Projeto
              </label>
              <input
                type="text"
                id="projectId"
                name="projectId"
                value={config.projectId}
                onChange={handleChange}
                className="admin-input"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                O ID do projeto pode ser encontrado nas configurações do projeto na Vercel.
              </p>
            </div>

            <div className="mb-4">
              <label htmlFor="teamId" className="admin-label">
                ID da Equipe (opcional)
              </label>
              <input
                type="text"
                id="teamId"
                name="teamId"
                value={config.teamId}
                onChange={handleChange}
                className="admin-input"
              />
              <p className="text-sm text-gray-500 mt-1">
                Necessário apenas se o projeto estiver em uma equipe na Vercel.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={status === "loading"}
                className="admin-btn admin-btn-success disabled:opacity-50"
              >
                {status === "loading" ? "Salvando..." : "Salvar Configuração"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
