"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { getMissas } from "@/lib/api"
import { Dialog, DialogContent } from "@/components/ui/dialog"

export default function LiveMassButton() {
  const [missas, setMissas] = useState<any[]>([])
  const [missaAoVivo, setMissaAoVivo] = useState<any>(null)
  const [ultimaMissa, setUltimaMissa] = useState<any>(null)
  const [isLive, setIsLive] = useState(false)
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const missasData = await getMissas()

        if (!Array.isArray(missasData) || missasData.length === 0) {
          setMissas([])
          setMissaAoVivo(null)
          setUltimaMissa(null)
          setIsLive(false)
          return
        }

        setMissas(missasData)

        // Verificar se tem missa ao vivo agora
        const agora = new Date()

        // Procurar por uma missa que esteja acontecendo agora
        const missaAtual = missasData.find((missa) => {
          const inicio = new Date(missa.inicio)
          const fim = new Date(missa.fim)
          return agora >= inicio && agora <= fim
        })

        if (missaAtual) {
          setMissaAoVivo(missaAtual)
          setIsLive(true)
        } else {
          setMissaAoVivo(null)
          setIsLive(false)

          // Se não tiver missa ao vivo, pegar a última missa
          setUltimaMissa(missasData[0]) // A lista já vem ordenada pela API
        }
      } catch (error) {
        console.error("Erro ao carregar missas:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()

    // Atualizar a cada minuto
    const interval = setInterval(loadData, 60000)
    return () => clearInterval(interval)
  }, [])

  function formatarData(dataString: string) {
    const data = new Date(dataString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(data)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center text-white">
        <div className="h-8 w-48 bg-gray-700/30 rounded-lg animate-pulse mb-2" />
        <div className="h-16 w-16 bg-yellow-500/50 rounded-full animate-pulse mb-2" />
        <div className="h-6 w-32 bg-gray-700/30 rounded-lg animate-pulse" />
      </div>
    )
  }

  if (!missaAoVivo && !ultimaMissa) {
    return null
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex flex-col items-center text-white">
        <h2 className="text-2xl font-bold mb-2">{isLive ? "Missa ao vivo" : "Assistir a última missa"}</h2>
        <div className="bg-yellow-500 rounded-full p-4 mb-2">
          <Image src="/images/live-icon.png" alt="Ao vivo" width={40} height={40} />
        </div>
        <span className="text-lg font-medium">{isLive ? "Assistir agora" : formatarData(ultimaMissa?.inicio)}</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl w-[90vw] h-[80vh] p-0">
          <iframe
            src={isLive ? missaAoVivo?.linkEmbed : ultimaMissa?.linkEmbed}
            title={isLive ? "Missa ao vivo" : "Última missa"}
            className="w-full h-full"
            allowFullScreen
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
