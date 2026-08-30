"use client"

import { useRef, useState } from "react"
import { AlertCircle, Camera, X } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import CandleFlame from "@/components/candle-flame"
import { usePushSubscription } from "@/hooks/use-push-subscription"
import { salvarVelaOwnership } from "@/lib/velas-ownership"

const FOTO_MAX_BYTES = 4 * 1024 * 1024
const FOTO_TIPOS_VALIDOS = ["image/jpeg", "image/png", "image/webp"]

const DURACOES = [
  { value: "3", label: "3 horas" },
  { value: "7", label: "7 horas" },
  { value: "24", label: "1 dia" },
  { value: "168", label: "7 dias" },
]

export type VelaExistente = {
  id: number
  nome: string
  nomePrivado: boolean
  intencao: string
  intencaoPrivada: boolean
  foto: string | null
  fotoPrivada: boolean
  ownershipToken: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  velaExistente?: VelaExistente
  onAcesa?: () => void
  onEditada?: () => void
}

export default function VelaDialog({ open, onOpenChange, velaExistente, onAcesa, onEditada }: Props) {
  const editando = Boolean(velaExistente)
  const push = usePushSubscription()

  const [nome, setNome] = useState(velaExistente?.nome ?? "")
  const [nomePrivado, setNomePrivado] = useState(velaExistente?.nomePrivado ?? false)
  const [intencao, setIntencao] = useState(velaExistente?.intencao ?? "")
  const [intencaoPrivada, setIntencaoPrivada] = useState(velaExistente?.intencaoPrivada ?? false)
  const [fotoPrivada, setFotoPrivada] = useState(velaExistente?.fotoPrivada ?? false)
  const [duracaoHoras, setDuracaoHoras] = useState("168")
  const [notificar, setNotificar] = useState(false)
  const [novaFoto, setNovaFoto] = useState<File | null>(null)
  const [previewFoto, setPreviewFoto] = useState<string | null>(velaExistente?.foto ?? null)
  const [removerFoto, setRemoverFoto] = useState(false)
  const [honeypot, setHoneypot] = useState("")
  const [status, setStatus] = useState<"idle" | "enviando" | "acesa" | "erro">("idle")
  const [erro, setErro] = useState("")
  const renderedAtRef = useRef(Date.now())

  function resetar() {
    setNome(velaExistente?.nome ?? "")
    setNomePrivado(velaExistente?.nomePrivado ?? false)
    setIntencao(velaExistente?.intencao ?? "")
    setIntencaoPrivada(velaExistente?.intencaoPrivada ?? false)
    setFotoPrivada(velaExistente?.fotoPrivada ?? false)
    setDuracaoHoras("168")
    setNotificar(false)
    setNovaFoto(null)
    setPreviewFoto(velaExistente?.foto ?? null)
    setRemoverFoto(false)
    setHoneypot("")
    setStatus("idle")
    setErro("")
    renderedAtRef.current = Date.now()
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetar()
    onOpenChange(next)
  }

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!FOTO_TIPOS_VALIDOS.includes(file.type)) {
      setErro("Formato de imagem não suportado. Envie uma foto em JPEG, PNG ou WEBP.")
      return
    }
    if (file.size > FOTO_MAX_BYTES) {
      setErro("A imagem é muito grande (máximo 4MB).")
      return
    }
    setErro("")
    setNovaFoto(file)
    setRemoverFoto(false)
    setPreviewFoto(URL.createObjectURL(file))
  }

  function handleRemoverFoto() {
    setNovaFoto(null)
    setPreviewFoto(null)
    setRemoverFoto(true)
  }

  async function handleNotificarChange(checked: boolean) {
    if (!checked) {
      setNotificar(false)
      return
    }
    if (push.isSubscribed) {
      setNotificar(true)
      return
    }
    const resultado = await push.activate()
    setNotificar(resultado === "granted")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("enviando")
    setErro("")

    const form = new FormData()
    if (editando && velaExistente) {
      form.append(
        "_payload",
        JSON.stringify({
          ownershipToken: velaExistente.ownershipToken,
          nome,
          nomePrivado,
          intencao,
          intencaoPrivada,
          fotoPrivada,
          removerFoto,
        })
      )
    } else {
      form.append(
        "_payload",
        JSON.stringify({
          nome,
          nomePrivado,
          intencao,
          intencaoPrivada,
          fotoPrivada,
          duracaoHoras,
          notifyEndpoint: notificar ? push.endpoint : null,
          email: honeypot,
          renderedAt: renderedAtRef.current,
        })
      )
    }
    if (novaFoto) form.append("foto", novaFoto)

    try {
      const url = editando && velaExistente ? `/api/velas/${velaExistente.id}/editar` : "/api/velas"
      const res = await fetch(url, { method: "POST", body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Não foi possível enviar.")

      if (editando) {
        onEditada?.()
        handleOpenChange(false)
      } else {
        salvarVelaOwnership(data.id, data.ownershipToken)
        setStatus("acesa")
        onAcesa?.()
      }
    } catch (err) {
      setStatus("erro")
      setErro(err instanceof Error ? err.message : "Erro inesperado.")
    }
  }

  const inputClass =
    "w-full rounded-md bg-parish-card/60 border border-white/25 px-3 py-2 text-white outline-none focus:border-yellow-500"

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col items-center gap-4">
          <CandleFlame lit={status === "acesa"} size="large" />

          {status === "acesa" ? (
            <div className="text-center space-y-4 w-full">
              <p className="text-white font-medium">Sua vela está acesa e já aparece na listagem.</p>
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                className="w-full bg-yellow-500 text-parish-card font-semibold px-5 py-2.5 rounded-md hover:bg-yellow-400 transition"
              >
                Fechar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <h2 className="text-xl font-semibold text-yellow-500 text-center">
                {editando ? "Editar vela" : "Acender uma vela"}
              </h2>

              {!editando && (
                // Honeypot anti-spam: invisível e fora do fluxo de tab.
                <input
                  type="text"
                  name="email"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="hidden"
                />
              )}

              <div className="space-y-1">
                <label className="text-sm text-gray-300">Seu nome *</label>
                <input
                  required
                  minLength={2}
                  maxLength={100}
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className={inputClass}
                  placeholder="Como devemos chamar você?"
                />
                <label className="flex items-center gap-2 text-xs text-gray-400 pt-1">
                  <input
                    type="checkbox"
                    checked={nomePrivado}
                    onChange={(e) => setNomePrivado(e.target.checked)}
                  />
                  Não quero deixar meu nome público
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-300">Intenção *</label>
                <textarea
                  required
                  minLength={5}
                  maxLength={1000}
                  rows={4}
                  value={intencao}
                  onChange={(e) => setIntencao(e.target.value)}
                  className={inputClass}
                  placeholder="Por quem ou pelo que você está rezando?"
                />
                <label className="flex items-center gap-2 text-xs text-gray-400 pt-1">
                  <input
                    type="checkbox"
                    checked={intencaoPrivada}
                    onChange={(e) => setIntencaoPrivada(e.target.checked)}
                  />
                  Não quero deixar minha intenção pública
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-300">Foto (opcional)</label>
                {previewFoto ? (
                  <div className="relative w-full h-32 rounded-md overflow-hidden bg-black/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewFoto} alt="Prévia da foto" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={handleRemoverFoto}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full"
                      aria-label="Remover foto"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 w-full h-20 rounded-md border border-dashed border-white/25 text-gray-400 text-sm cursor-pointer hover:border-yellow-500">
                    <Camera size={18} />
                    Adicionar uma foto
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFotoChange}
                      className="hidden"
                    />
                  </label>
                )}
                <label className="flex items-center gap-2 text-xs text-gray-400 pt-1">
                  <input type="checkbox" checked={fotoPrivada} onChange={(e) => setFotoPrivada(e.target.checked)} />
                  Não quero deixar minha foto pública
                </label>
              </div>

              {!editando && (
                <>
                  <div className="space-y-1">
                    <label className="text-sm text-gray-300">Por quanto tempo a vela fica acesa? *</label>
                    <select
                      value={duracaoHoras}
                      onChange={(e) => setDuracaoHoras(e.target.value)}
                      className={inputClass}
                    >
                      {DURACOES.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={notificar}
                      onChange={(e) => handleNotificarChange(e.target.checked)}
                      disabled={push.isLoading}
                    />
                    Notificar quando a vela apagar
                  </label>
                </>
              )}

              {erro && (
                <div className="flex items-start gap-2 bg-red-500/15 border border-red-500/30 rounded-md p-3 text-red-200">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="text-sm">{erro}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={status === "enviando"}
                className="w-full bg-yellow-500 text-parish-card font-semibold px-5 py-2.5 rounded-md hover:bg-yellow-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === "enviando"
                  ? editando
                    ? "Salvando..."
                    : "Acendendo..."
                  : editando
                    ? "Salvar alterações"
                    : "Acender vela"}
              </button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
