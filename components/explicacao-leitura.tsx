"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, Loader2, X, Volume2, Pause } from "lucide-react"

// Adicionar interface para Wake Lock API
interface WakeLock {
  request(type: "screen"): Promise<WakeLockSentinel>
}

interface WakeLockSentinel {
  release(): Promise<void>
  released: boolean
  type: "screen"
}

declare global {
  interface Navigator {
    wakeLock?: WakeLock
  }
}

interface ExplicacaoLeituraProps {
  tipo: string
  referencia: string
  titulo: string
  texto: string
}

export default function ExplicacaoLeitura({ tipo, referencia, titulo, texto }: ExplicacaoLeituraProps) {
  const [explicacao, setExplicacao] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mostrarExplicacao, setMostrarExplicacao] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null)

  const buscarExplicacao = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/liturgia/explicacao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo,
          referencia,
          titulo,
          texto,
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao buscar explicação")
      }

      const data = await response.json()
      setExplicacao(data.explicacao)
      setMostrarExplicacao(true)
    } catch (err) {
      setError("Não foi possível obter a explicação. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const fecharExplicacao = () => {
    setMostrarExplicacao(false)
    stopSpeaking()
  }

  const startSpeaking = async () => {
    if (!explicacao) return

    // Verificar se a API de síntese de voz está disponível
    if ("speechSynthesis" in window) {
      try {
        // Solicitar Wake Lock para manter a tela ligada
        if ("wakeLock" in navigator) {
          try {
            const wakeLockSentinel = await navigator.wakeLock!.request("screen")
            setWakeLock(wakeLockSentinel)
            console.log("Wake Lock ativado - tela permanecerá ligada")
          } catch (err) {
            console.warn("Não foi possível ativar o Wake Lock:", err)
          }
        }

        const synth = window.speechSynthesis
        synthRef.current = synth

        // Configurar a fala
        const utterance = new SpeechSynthesisUtterance(explicacao)
        utterance.lang = "pt-BR" // Definir o idioma para português brasileiro
        utterance.rate = 0.9 // Ajustar a velocidade da fala

        utterance.onstart = () => {
          setIsSpeaking(true)
        }

        utterance.onend = () => {
          setIsSpeaking(false)
          releaseWakeLock()
        }

        utterance.onerror = (event) => {
          console.error("Erro na síntese de voz:", event.error)
          setError("Erro ao iniciar a reprodução de áudio")
          setIsSpeaking(false)
          releaseWakeLock()
        }

        synth.speak(utterance)
      } catch (err) {
        console.error("Erro ao iniciar reprodução:", err)
        setError("Erro ao iniciar a reprodução de áudio")
      }
    } else {
      setError("A API de síntese de voz não é suportada neste navegador")
    }
  }

  const stopSpeaking = () => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
    releaseWakeLock()
  }

  const releaseWakeLock = async () => {
    if (wakeLock && !wakeLock.released) {
      try {
        await wakeLock.release()
        setWakeLock(null)
        console.log("Wake Lock liberado")
      } catch (err) {
        console.warn("Erro ao liberar Wake Lock:", err)
      }
    }
  }

  // Cleanup quando o componente for desmontado ou quando sair da página
  useEffect(() => {
    const handleBeforeUnload = () => {
      stopSpeaking()
    }

    const handleVisibilityChange = () => {
      if (document.hidden && isSpeaking) {
        // Página ficou oculta, mas mantém a reprodução
        console.log("Página oculta, mas mantendo reprodução de áudio")
      }
    }

    // Adicionar listeners
    window.addEventListener("beforeunload", handleBeforeUnload)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Cleanup quando o componente for desmontado
    return () => {
      stopSpeaking()
      window.removeEventListener("beforeunload", handleBeforeUnload)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [isSpeaking])

  // Cleanup do Wake Lock quando o componente for desmontado
  useEffect(() => {
    return () => {
      releaseWakeLock()
    }
  }, [wakeLock])

  return (
    <div className="mt-4">
      {error && <div className="mb-3 text-red-400 text-sm">{error}</div>}

      {!mostrarExplicacao ? (
        <Button
          onClick={buscarExplicacao}
          disabled={loading}
          variant="outline"
          size="sm"
          className="bg-blue-800/50 border-blue-500/50 text-blue-200 hover:bg-blue-700/50 hover:text-white"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando explicação...
            </>
          ) : (
            <>
              <MessageCircle className="mr-2 h-4 w-4" />
              Ver explicação
            </>
          )}
        </Button>
      ) : (
        <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/30">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-blue-300 font-medium flex items-center">
              <MessageCircle className="mr-2" size={16} />
              Explicação - {tipo}
            </h5>
            <Button
              onClick={fecharExplicacao}
              variant="ghost"
              size="sm"
              className="text-blue-300 hover:text-white hover:bg-blue-800/50"
            >
              <X size={16} />
            </Button>
          </div>

          {/* Botão de ouvir ANTES do texto */}
          <div className="flex justify-center mb-4">
            <Button
              onClick={isSpeaking ? stopSpeaking : startSpeaking}
              variant="default"
              size="default"
              className="bg-yellow-500 hover:bg-yellow-600 text-[#4d3600] font-medium px-6 py-2"
              disabled={loading || !explicacao}
            >
              {isSpeaking ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pausar Áudio
                </>
              ) : (
                <>
                  <Volume2 className="mr-2 h-4 w-4" />
                  Ouvir a Explicação
                </>
              )}
            </Button>
          </div>

          <div className="text-gray-200 leading-relaxed whitespace-pre-line">{explicacao}</div>
        </div>
      )}
    </div>
  )
}
