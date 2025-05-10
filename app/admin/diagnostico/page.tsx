"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function DiagnosticoGitHub() {
  const [diagnostico, setDiagnostico] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadDiagnostico() {
      try {
        setLoading(true)
        const res = await fetch("/api/admin/diagnostico")
        if (res.ok) {
          const data = await res.json()
          setDiagnostico(data)
        } else {
          setError("Erro ao carregar diagnóstico")
        }
      } catch (error: any) {
        setError(`Erro: ${error.message || "Erro desconhecido"}`)
      } finally {
        setLoading(false)
      }
    }

    loadDiagnostico()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-[#0a1e42] text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Diagnóstico da Integração com GitHub</h1>
          <div className="space-x-2">
            <Link href="/admin/configuracao" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Configuração
            </Link>
            <Link href="/admin" className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">
              Voltar
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Diagnóstico da Integração com GitHub</h2>

          {loading && <p className="text-gray-700">Carregando diagnóstico...</p>}

          {error && <div className="p-4 bg-red-100 border-l-4 border-red-400 text-red-700 mb-4">{error}</div>}

          {diagnostico && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Configuração</h3>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(diagnostico.configuracao, null, 2)}</pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Testes</h3>
                {Object.entries(diagnostico.testes).map(([key, value]: [string, any]) => (
                  <div key={key} className="mb-4">
                    <h4 className="font-medium mb-1 capitalize">{key}</h4>
                    <div className={`p-3 rounded-lg ${value.ok ? "bg-green-100" : "bg-red-100"}`}>
                      <div className="flex items-center mb-2">
                        <div className={`w-3 h-3 rounded-full mr-2 ${value.ok ? "bg-green-500" : "bg-red-500"}`}></div>
                        <span className={value.ok ? "text-green-700" : "text-red-700"}>{value.message}</span>
                      </div>
                      {value.status && <div className="text-sm">Status: {value.status}</div>}
                      {value.details && (
                        <div className="mt-2 bg-white p-2 rounded text-sm">
                          <pre className="whitespace-pre-wrap">{JSON.stringify(value.details, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Solução de Problemas Comuns</h3>
                <ul className="list-disc list-inside text-yellow-800 space-y-2">
                  <li>
                    <strong>Token inválido ou expirado:</strong> Gere um novo token no GitHub e atualize a configuração.
                  </li>
                  <li>
                    <strong>Permissões insuficientes:</strong> Certifique-se de que o token tem o escopo "repo" para
                    repositórios privados ou "public_repo" para repositórios públicos.
                  </li>
                  <li>
                    <strong>Repositório não encontrado:</strong> Verifique se o nome do usuário/organização e do
                    repositório estão corretos.
                  </li>
                  <li>
                    <strong>Branch não encontrada:</strong> Verifique se o nome da branch está correto (geralmente é
                    "main" ou "master").
                  </li>
                  <li>
                    <strong>Pasta "data" não encontrada:</strong> Certifique-se de que a pasta "data" existe no
                    repositório e contém os arquivos JSON necessários.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
