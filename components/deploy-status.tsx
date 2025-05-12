"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, RefreshCw } from "lucide-react"

interface DeployStatusProps {
  commitSha?: string
  onDeployComplete?: () => void
  autoRefresh?: boolean
}

export default function DeployStatus({ commitSha, onDeployComplete, autoRefresh = true }: DeployStatusProps) {
  const [status, setStatus] = useState<"pending" | "success" | "error" | "idle">("idle")
  const [message, setMessage] = useState<string>("")
  const [isPolling, setIsPolling] = useState<boolean>(false)
  const [elapsedTime, setElapsedTime] = useState<number>(0)

  // Iniciar verificação quando receber um commitSha
  useEffect(() => {
    if (commitSha) {
      setStatus("pending")
      setMessage("Iniciando deploy...")
      setIsPolling(true)
      setElapsedTime(0)
    } else {
      setStatus("idle")
      setIsPolling(false)
    }
  }, [commitSha])

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
      if (!commitSha || !isPolling) return

      try {
        const response = await fetch(`/api/admin/deploy-status?sha=${commitSha}`)
        const data = await response.json()

        if (data.status === "success") {
          setStatus("success")
          setMessage("Deploy concluído com sucesso!")
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
          setMessage(`Erro no deploy: ${data.message || "Erro desconhecido"}`)
          setIsPolling(false)
        } else if (data.status === "pending") {
          setStatus("pending")
          setMessage(data.message || "Deploy em andamento...")
        }
      } catch (error) {
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
  }, [commitSha, isPolling, onDeployComplete, autoRefresh])

  if (status === "idle") {
    return null
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div
      className={`p-4 rounded-lg mb-4 flex items-start ${
        status === "success"
          ? "bg-green-50 border border-green-200"
          : status === "error"
            ? "bg-red-50 border border-red-200"
            : "bg-blue-50 border border-blue-200"
      }`}
    >
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
        {status === "pending" && (
          <div className="mt-2">
            <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 animate-pulse rounded-full"></div>
            </div>
            <p className="text-xs text-blue-600 mt-1">Tempo decorrido: {formatTime(elapsedTime)}</p>
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
  )
}
