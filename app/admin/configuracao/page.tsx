"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function ConfiguracaoGitHub() {
  const [config, setConfig] = useState({
    owner: "",
    repo: "",
    branch: "main",
    token: "",
  })
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [detailedError, setDetailedError] = useState("")

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("/api/admin/config")
        if (res.ok) {
          const data = await res.json()
          setConfig({
            owner: data.owner || "",
            repo: data.repo || "",
            branch: data.branch || "main",
            token: "", // Não exibir o token por segurança
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
    setDetailedError("")

    try {
      const res = await fetch("/api/admin/config", {
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

        // Adicionar informações detalhadas para ajudar na depuração
        setDetailedError(`
          Detalhes técnicos:
          - Status: ${res.status}
          - Resposta: ${JSON.stringify(data)}
          
          Verifique:
          1. Se o token tem o escopo 'repo' ou 'public_repo'
          2. Se o nome do usuário/organização está correto
          3. Se o nome do repositório está correto
          4. Se o nome da branch está correto
        `)
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
    <div className="min-h-screen bg-gray-100">
      <header className="bg-[#0a1e42] text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Configuração do GitHub</h1>
          <Link href="/admin" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Voltar
          </Link>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="mb-4 text-gray-700">
            Para que o painel administrativo funcione corretamente, é necessário configurar a integração com o GitHub.
            Isso permitirá que as alterações feitas no painel sejam salvas diretamente no repositório do GitHub.
          </p>

          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">Como obter um token do GitHub</h2>
            <ol className="list-decimal list-inside text-yellow-800 space-y-2">
              <li>
                Acesse{" "}
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  https://github.com/settings/tokens
                </a>
              </li>
              <li>Clique em "Generate new token" e selecione "Generate new token (classic)"</li>
              <li>Dê um nome ao token (ex: "Paróquia São Sebastião")</li>
              <li className="font-bold">
                Selecione o escopo "repo" para permitir acesso completo ao repositório (muito importante!)
              </li>
              <li>Clique em "Generate token" e copie o token gerado</li>
              <li>Cole o token no campo abaixo</li>
            </ol>

            <div className="mt-4 p-2 bg-blue-50 border-l-4 border-blue-400 text-blue-800">
              <p className="font-semibold">Dica importante:</p>
              <p>
                Certifique-se de que o token tem permissões de escrita no repositório. Se o repositório for privado,
                você precisa do escopo "repo". Se for público, o escopo "public_repo" é suficiente.
              </p>
            </div>
          </div>

          {status === "success" && (
            <div className="mb-4 p-4 bg-green-100 border-l-4 border-green-400 text-green-700">{message}</div>
          )}

          {status === "error" && (
            <div className="mb-4">
              <div className="p-4 bg-red-100 border-l-4 border-red-400 text-red-700">{message}</div>
              {detailedError && (
                <div className="mt-2 p-4 bg-gray-100 border-l-4 border-gray-400 text-gray-700 whitespace-pre-line text-sm font-mono">
                  {detailedError}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="owner" className="block text-gray-700 text-sm font-bold mb-2">
                Proprietário do Repositório (usuário ou organização)
              </label>
              <input
                type="text"
                id="owner"
                name="owner"
                value={config.owner}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
              <p className="text-sm text-gray-500 mt-1">Ex: "seu-usuario-github" (sem aspas)</p>
            </div>

            <div className="mb-4">
              <label htmlFor="repo" className="block text-gray-700 text-sm font-bold mb-2">
                Nome do Repositório
              </label>
              <input
                type="text"
                id="repo"
                name="repo"
                value={config.repo}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
              <p className="text-sm text-gray-500 mt-1">Ex: "paroquia-sao-sebastiao" (sem aspas)</p>
            </div>

            <div className="mb-4">
              <label htmlFor="branch" className="block text-gray-700 text-sm font-bold mb-2">
                Branch Principal
              </label>
              <input
                type="text"
                id="branch"
                name="branch"
                value={config.branch}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
              <p className="text-sm text-gray-500 mt-1">Geralmente é "main" ou "master"</p>
            </div>

            <div className="mb-4">
              <label htmlFor="token" className="block text-gray-700 text-sm font-bold mb-2">
                Token de Acesso Pessoal do GitHub
              </label>
              <input
                type="password"
                id="token"
                name="token"
                value={config.token}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Este token será usado para autenticar as requisições à API do GitHub. Certifique-se de que ele tem o
                escopo "repo".
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={status === "loading"}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
              >
                {status === "loading" ? "Salvando..." : "Salvar Configuração"}
              </button>
            </div>
          </form>
          <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
            <Link href="/admin/diagnostico" className="text-blue-600 hover:text-blue-800">
              Executar diagnóstico da integração
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
