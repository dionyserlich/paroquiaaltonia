"use client"

import { useCallback, useEffect, useState } from "react"
import { Flame, Pencil, X } from "lucide-react"
import CandleFlame from "@/components/candle-flame"
import VelaDialog, { type VelaExistente } from "@/components/vela-dialog"
import { getMinhasVelas, getTokenParaVela, removerVelaOwnership } from "@/lib/velas-ownership"

type VelaPublica = {
  id: number
  nome: string | null
  intencao: string | null
  intencaoPrivada: boolean
  foto: string | null
  createdAt: string
  expiraEm: string
}

type VelaMinha = {
  id: number
  nome: string
  nomePrivado: boolean
  intencao: string
  intencaoPrivada: boolean
  foto: string | null
  fotoPrivada: boolean
  duracaoHoras: string
  createdAt: string
  expiraEm: string
}

function formatarData(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
    new Date(iso)
  )
}

export default function VelasContent() {
  const [velas, setVelas] = useState<VelaPublica[]>([])
  const [minhas, setMinhas] = useState<Record<number, VelaMinha>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [apagando, setApagando] = useState<Set<number>>(new Set())
  const [dialogAberto, setDialogAberto] = useState(false)
  const [editando, setEditando] = useState<VelaExistente | null>(null)

  const carregar = useCallback(async () => {
    try {
      const res = await fetch("/api/velas/publicas", { cache: "no-store" })
      const data: VelaPublica[] = res.ok ? await res.json() : []
      setVelas(Array.isArray(data) ? data : [])

      const ownerships = getMinhasVelas()
      const idsAtuais = new Set(data.map((v) => v.id))
      // Poda ownerships órfãos (vela já não existe mais na listagem pública).
      for (const o of ownerships) {
        if (!idsAtuais.has(o.id)) removerVelaOwnership(o.id)
      }

      const minhasAtuais = ownerships.filter((o) => idsAtuais.has(o.id))
      const entradas = await Promise.all(
        minhasAtuais.map(async (o) => {
          try {
            const r = await fetch(`/api/velas/${o.id}/minha?ownershipToken=${encodeURIComponent(o.token)}`)
            if (!r.ok) return null
            const doc: VelaMinha = await r.json()
            return [o.id, doc] as const
          } catch {
            return null
          }
        })
      )
      const mapa: Record<number, VelaMinha> = {}
      for (const entrada of entradas) {
        if (entrada) mapa[entrada[0]] = entrada[1]
      }
      setMinhas(mapa)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    carregar()
    const interval = setInterval(carregar, 60000)
    return () => clearInterval(interval)
  }, [carregar])

  async function handleApagar(id: number) {
    const token = getTokenParaVela(id)
    if (!token) return
    setApagando((s) => new Set(s).add(id))
    try {
      const res = await fetch(`/api/velas/${id}/apagar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownershipToken: token }),
      })
      if (res.ok) {
        setTimeout(() => {
          removerVelaOwnership(id)
          setVelas((vs) => vs.filter((v) => v.id !== id))
          setApagando((s) => {
            const next = new Set(s)
            next.delete(id)
            return next
          })
        }, 600) // combina com a duração da animação vela-apagando (globals.css)
      } else {
        setApagando((s) => {
          const next = new Set(s)
          next.delete(id)
          return next
        })
      }
    } catch {
      setApagando((s) => {
        const next = new Set(s)
        next.delete(id)
        return next
      })
    }
  }

  function abrirEditar(id: number) {
    const token = getTokenParaVela(id)
    const minha = minhas[id]
    if (!token || !minha) return
    setEditando({
      id,
      nome: minha.nome,
      nomePrivado: minha.nomePrivado,
      intencao: minha.intencao,
      intencaoPrivada: minha.intencaoPrivada,
      foto: minha.foto,
      fotoPrivada: minha.fotoPrivada,
      ownershipToken: token,
    })
    setDialogAberto(true)
  }

  function abrirAcender() {
    setEditando(null)
    setDialogAberto(true)
  }

  return (
    <div className="container mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-4">
          <div className="bg-yellow-500 p-4 rounded-full">
            <Flame className="w-8 h-8 text-parish-card" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">Acenda uma Vela</h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Acenda uma vela virtual e faça sua oração. Sua vela fica acesa pelo tempo que você escolher.
        </p>
        <button
          onClick={abrirAcender}
          className="inline-flex items-center gap-2 bg-yellow-500 text-parish-card font-semibold px-6 py-3 rounded-full hover:bg-yellow-400 transition"
        >
          <Flame size={18} />
          Acender uma vela
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : velas.length === 0 ? (
        <div className="bg-white/5 rounded-lg p-6 text-center">
          <p className="text-gray-300 text-sm">Nenhuma vela acesa no momento. Seja o primeiro a acender uma.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {velas.map((vela) => {
            const token = getTokenParaVela(vela.id)
            const minha = token ? minhas[vela.id] : null
            const souDono = Boolean(token && minha)

            const nomeExibido = souDono ? minha!.nome : vela.nome
            const nomeEhPrivadoMostrarAviso = souDono && minha!.nomePrivado
            const intencaoExibida = souDono ? minha!.intencao : vela.intencao
            const intencaoEhPrivadaMostrarAviso = souDono && minha!.intencaoPrivada
            const fotoExibida = souDono ? minha!.foto : vela.foto
            const fotoEhPrivadaMostrarAviso = souDono && minha!.fotoPrivada

            return (
              <div
                key={vela.id}
                className={`relative rounded-lg overflow-hidden bg-black aspect-[3/4] ${
                  apagando.has(vela.id) ? "vela-apagando" : ""
                }`}
              >
                {fotoExibida && (
                  <div className="absolute inset-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={fotoExibida} alt="" className="w-full h-full object-cover" />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(0deg, rgba(0,0,0,1) 25%, rgba(0,0,0,0.15) 55%, transparent 70%)",
                      }}
                    />
                    {fotoEhPrivadaMostrarAviso && (
                      <span className="absolute top-2 left-2 text-xs bg-white/10 text-gray-200 px-2 py-1 rounded-full">
                        Somente você vê esta imagem.
                      </span>
                    )}
                  </div>
                )}

                {/* A vela aparece sempre, com ou sem foto — ancorada perto de
                    onde o bloco de texto começa, por cima da foto (quando
                    tem) ou do fundo preto (quando não tem). */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-[24%]">
                  <CandleFlame lit size="large" />
                </div>

                {souDono && (
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <button
                      onClick={() => abrirEditar(vela.id)}
                      className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
                      aria-label="Editar vela"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleApagar(vela.id)}
                      className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
                      aria-label="Apagar vela"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1">
                  {nomeExibido && (
                    <div>
                      <p className="text-sm text-gray-400">Vela de</p>
                      <p className="text-xl font-bold text-white">{nomeExibido}</p>
                      {nomeEhPrivadoMostrarAviso && (
                        <p className="text-xs text-gray-400 italic">Só você vê esta informação.</p>
                      )}
                    </div>
                  )}
                  {intencaoExibida ? (
                    <div>
                      <p className="text-gray-300 text-sm">Intenção: {intencaoExibida}</p>
                      {intencaoEhPrivadaMostrarAviso && (
                        <p className="text-xs text-gray-400 italic">Só você vê esta informação.</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-300 text-sm italic">
                      A pessoa que acendeu esta vela preferiu não divulgar a sua intenção.
                    </p>
                  )}
                  <p className="text-xs text-gray-400">{formatarData(vela.createdAt)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <VelaDialog
        // A key muda por vela (ou "novo") pra forçar o React a remontar o
        // diálogo do zero ao trocar de vela editada — sem isso, o useState
        // interno só roda o inicializador uma vez e fica com os dados da
        // primeira vela aberta, mesmo depois de trocar velaExistente.
        key={editando?.id ?? "novo"}
        open={dialogAberto}
        onOpenChange={setDialogAberto}
        velaExistente={editando ?? undefined}
        onAcesa={carregar}
        onEditada={carregar}
      />
    </div>
  )
}
