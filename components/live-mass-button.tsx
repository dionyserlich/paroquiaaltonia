"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { getMissas } from "@/lib/api"
import { Dialog, DialogContent } from "@/components/ui/dialog"

type Missa = {
  id: number
  titulo?: string | null
  inicio: string
  fim?: string | null
  linkEmbed?: string | null
}

export default function LiveMassButton() {
  const [missaAoVivo, setMissaAoVivo] = useState<Missa | null>(null)
  const [ultimaMissa, setUltimaMissa] = useState<Missa | null>(null)
  const [isLive, setIsLive] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    async function loadData() {
      const [missasData, botLive] = await Promise.all([
        getMissas(),
        fetch(`/api/missa-ao-vivo?t=${Date.now()}`, { cache: "no-store" })
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null),
      ])

      if (!Array.isArray(missasData) || missasData.length === 0) {
        if (botLive?.linkEmbed) {
          setMissaAoVivo(botLive)
          setIsLive(true)
          setUltimaMissa(null)
        } else {
          setMissaAoVivo(null)
          setUltimaMissa(null)
          setIsLive(false)
        }
        return
      }

      const agora = new Date()

      if (botLive?.linkEmbed) {
        setMissaAoVivo(botLive)
        setIsLive(true)
        return
      }

      const missaAtual = (missasData as Missa[]).find((missa) => {
        const inicio = new Date(missa.inicio)
        // `fim` em branco significa que a missa (cadastrada pelo bot) ainda
        // está ao vivo — tratar como "sem fim ainda", não como já encerrada.
        const fim = missa.fim ? new Date(missa.fim) : null
        return agora >= inicio && (fim === null || agora <= fim)
      })

      if (missaAtual) {
        setMissaAoVivo(missaAtual)
        setIsLive(true)
      } else {
        setMissaAoVivo(null)
        setIsLive(false)
        setUltimaMissa(missasData[0])
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
        <span className="text-lg font-medium">
          {isLive ? "Assistir agora" : ultimaMissa && formatarData(ultimaMissa.inicio)}
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl w-[90vw] h-[80vh] p-0">
          <iframe
            src={(isLive ? missaAoVivo?.linkEmbed : ultimaMissa?.linkEmbed) ?? undefined}
            title={isLive ? "Missa ao vivo" : "Última missa"}
            className="w-full h-full"
            allowFullScreen
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
