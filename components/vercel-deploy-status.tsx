"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, RefreshCw, ExternalLink } from "lucide-react"

interface VercelDeployStatusProps {
  deployId?: string
  showRecent?: boolean
  onDeployComplete?: () => void
  autoRefresh?: boolean
}

export default function VercelDeployStatus({
  deployId,
  showRecent = false,
  onDeployComplete,
  autoRefresh = true,
}: VercelDeployStatusProps) {
  const [status, setStatus] = useState<"pending" | "success" | "error" | "idle">("idle")
  const [message, setMessage] = useState<string>("")
  const [deployData, setDeployData] = useState<any>(null)
  const [recentDeploys, setRecentDeploys] = useState<any[]>([])
  const [isPolling, setIsPolling] = useState<boolean>(false)
  const [elapsedTime, setElapsedTime] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)

  // Iniciar verificação quando receber um deployId
  useEffect(() => {
    if (deployId) {
      setStatus("pending")
      setMessage("Verificando status do deploy...")
      setIsPolling(true)
      setElapsedTime(0)
      setError(null)
    } else if (showRecent) {
      loadRecentDeploys()
    } else {
      setStatus("idle")
      setIsPolling(false)
    }
  }, [deployId, showRecent])

  // Carregar deploys recentes
  async function loadRecentDeploys() {
    try {
      setError(null)
      const response = await fetch("/api/admin/vercel-status")

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Erro ao carregar deploys:", errorData)

        // Extrair mensagem de erro mais detalhada
        const errorMessage = errorData.message || `Erro ${response.status}: ${response.statusText}`
        const errorDetails = errorData.details ? `\nDetalhes: ${errorData.details}` : ""

        throw new Error(`${errorMessage}${errorDetails}`)
      }

      const data = await response.json()

      if (data.deploys && Array.isArray(data.deploys)) {
        setRecentDeploys(data.deploys)
      } else {
        console.error("Formato de resposta inesperado:", data)
        throw new Error("Formato de resposta inesperado da API")
      }
    } catch (error: any) {
      console.error("Erro ao carregar deploys recentes:", error)
      setError(error.message || "Erro ao carregar deploys recentes")
    }
  }

  // Contador de tempo decorrido
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isPolling) {
      timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isPolling])

  // Polling para verificar o status do deploy
  useEffect(() => {
    let pollTimer: NodeJS.Timeout

    const checkDeployStatus = async () => {
      if (!deployId || !isPolling) return

      try {
        const response = await fetch(`/api/admin/vercel-status?deployId=${deployId}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Erro ao verificar status do deploy")
        }

        const data = await response.json()

        setDeployData(data.deploy)

        if (data.status === "success") {
          setStatus("success")
          setMessage(data.message || "Deploy concluído com sucesso!")
          setIsPolling(false)

          if (onDeployComplete) {
            onDeployComplete()
          }

          if (autoRefresh) {
            setTimeout(() => {
              window.location.reload()
            }, 2000)
          }
        } else if (data.status === "error") {
          setStatus("error")
          setMessage(data.message || "Erro no deploy")
          setIsPolling(false)
        } else if (data.status === "pending") {
          setStatus("pending")
          setMessage(data.message || "Deploy em andamento...")
        }
      } catch (error: any) {
        console.error("Erro ao verificar status do deploy:", error)
        // Não interromper o polling em caso de erro de rede
        setMessage("Verificando status do deploy...")
      }
    }

    if (isPolling) {
      // Verificar imediatamente
      checkDeployStatus()

      // E então a cada 5 segundos
      pollTimer = setInterval(checkDeployStatus, 5000)
    }

    return () => {
      if (pollTimer) clearInterval(pollTimer)
    }
  }, [deployId, isPolling, onDeployComplete, autoRefresh])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  if (status === "idle" && !showRecent) {
    return null
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg mb-4 bg-red-50 border border-red-200">
        <div className="flex items-start">
          <div className="mr-3 mt-1">
            <XCircle className="text-red-500" size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-red-800">Erro ao carregar status do deploy</h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
          <button
            onClick={showRecent ? loadRecentDeploys : () => window.location.reload()}
            className="ml-2 p-2 bg-red-100 hover:bg-red-200 rounded-full"
            title="Tentar novamente"
          >
            <RefreshCw size={16} className="text-red-600" />
          </button>
        </div>
      </div>
    )
  }

  if (showRecent) {
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-gray-800">Deploys Recentes</h3>
          <button
            onClick={loadRecentDeploys}
            className="p-1 bg-gray-100 hover:bg-gray-200 rounded-full"
            title="Atualizar"
          >
            <RefreshCw size={16} className="text-gray-600" />
          </button>
        </div>

        {recentDeploys.length === 0 ? (
          <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">Nenhum deploy encontrado</div>
        ) : (
          <div className="space-y-2">
            {recentDeploys.map((deploy) => (
              <div
                key={deploy.id}
                className={`p-3 rounded-lg border ${
                  deploy.status === "success"
                    ? "bg-green-50 border-green-200"
                    : deploy.status === "error"
                      ? "bg-red-50 border-red-200"
                      : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex items-start">
                  <div className="mr-3 mt-1">
                    {deploy.status === "success" && <CheckCircle className="text-green-500" size={18} />}
                    {deploy.status === "error" && <XCircle className="text-red-500" size={18} />}
                    {deploy.status === "pending" && <RefreshCw className="text-blue-500 animate-spin" size={18} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4
                        className={`font-medium ${
                          deploy.status === "success"
                            ? "text-green-800"
                            : deploy.status === "error"
                              ? "text-red-800"
                              : "text-blue-800"
                        }`}
                      >
                        {deploy.meta?.githubCommitMessage || `Deploy ${deploy.id.substring(0, 8)}`}
                      </h4>
                      <span className="text-xs text-gray-500">{formatDate(deploy.createdAt)}</span>
                    </div>
                    <p
                      className={`text-sm ${
                        deploy.status === "success"
                          ? "text-green-600"
                          : deploy.status === "error"
                            ? "text-red-600"
                            : "text-blue-600"
                      }`}
                    >
                      {deploy.message}
                    </p>
                    {deploy.url && (
                      <div className="mt-1">
                        <a
                          href={deploy.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs flex items-center text-blue-600 hover:underline"
                        >
                          <ExternalLink size={12} className="mr-1" />
                          {deploy.url}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={`p-4 rounded-lg mb-4 ${
        status === "success"
          ? "bg-green-50 border border-green-200"
          : status === "error"
            ? "bg-red-50 border border-red-200"
            : "bg-blue-50 border border-blue-200"
      }`}
    >
      <div className="flex items-start">
        <div className="mr-3 mt-1">
          {status === "success" && <CheckCircle className="text-green-500" size={20} />}
          {status === "error" && <XCircle className="text-red-500" size={20} />}
          {status === "pending" && <RefreshCw className="text-blue-500 animate-spin" size={20} />}
        </div>
        <div className="flex-1">
          <h3
            className={`font-medium ${
              status === "success" ? "text-green-800" : status === "error" ? "text-red-800" : "text-blue-800"
            }`}
          >
            {status === "success" ? "Deploy concluído" : status === "error" ? "Erro no deploy" : "Deploy em andamento"}
          </h3>
          <p
            className={`text-sm ${
              status === "success" ? "text-green-600" : status === "error" ? "text-red-600" : "text-blue-600"
            }`}
          >
            {message}
          </p>

          {deployData && deployData.meta && deployData.meta.githubCommitMessage && (
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Commit:</span> {deployData.meta.githubCommitMessage}
            </p>
          )}

          {deployData && deployData.url && (
            <div className="mt-1">
              <a
                href={`https://${deployData.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm flex items-center text-blue-600 hover:underline"
              >
                <ExternalLink size={14} className="mr-1" />
                {`https://${deployData.url}`}
              </a>
            </div>
          )}

          {status === "pending" && (
            <div className="mt-2">
              <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 animate-pulse rounded-full"></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-blue-600">
                <span>Tempo decorrido: {formatTime(elapsedTime)}</span>
                {deployData && deployData.buildingAt && <span>Iniciado em: {formatDate(deployData.buildingAt)}</span>}
              </div>
            </div>
          )}
        </div>
        {status === "error" && (
          <button
            onClick={() => window.location.reload()}
            className="ml-2 p-2 bg-red-100 hover:bg-red-200 rounded-full"
            title="Atualizar página"
          >
            <RefreshCw size={16} className="text-red-600" />
          </button>
        )}
      </div>
    </div>
  )
}
