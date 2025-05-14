"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, RefreshCw, ExternalLink } from "lucide-react"

interface VercelDeployNotificationProps {
  deployId?: string
  onDeployComplete?: () => void
  autoRefresh?: boolean
}

export default function VercelDeployNotification({
  deployId,
  onDeployComplete,
  autoRefresh = true,
}: VercelDeployNotificationProps) {
  const [status, setStatus] = useState<"pending" | "success" | "error" | "idle">("idle")
  const [message, setMessage] = useState<string>("")
  const [deployData, setDeployData] = useState<any>(null)
  const [isPolling, setIsPolling] = useState<boolean>(false)
  const [elapsedTime, setElapsedTime] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Garantir que o componente só seja renderizado no cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  // Iniciar verificação quando receber um deployId
  useEffect(() => {
    if (!mounted) return

    if (deployId) {
      setStatus("pending")
      setMessage("Verificando status do deploy...")
      setIsPolling(true)
      setElapsedTime(0)
      setError(null)
    } else {
      setStatus("idle")
      setIsPolling(false)
    }
  }, [deployId, mounted])

  // Contador de tempo decorrido
  useEffect(() => {
    if (!mounted) return

    let timer: NodeJS.Timeout

    if (isPolling) {
      timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isPolling, mounted])

  // Polling para verificar o status do deploy
  useEffect(() => {
    if (!mounted) return

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
  }, [deployId, isPolling, onDeployComplete, autoRefresh, mounted])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  if (!mounted || status === "idle") {
    return null
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
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
        {status !== "pending" && (
          <button onClick={() => setStatus("idle")} className="ml-2 p-1 hover:bg-gray-200 rounded-full" title="Fechar">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
