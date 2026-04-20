"use client"

import { useState } from "react"
import { Heart, Calendar, Users, Cross, Gift, Plus, Send, CheckCircle2, AlertCircle } from "lucide-react"

const tiposIntencoes = [
  {
    tipo: "Aniversário e Nascimento",
    icon: <Gift className="w-5 h-5" />,
    descricao: "Celebre datas especiais com uma missa de ação de graças",
    cor: "border-yellow-500",
  },
  {
    tipo: "Aniversário de Casamento",
    icon: <Heart className="w-5 h-5" />,
    descricao: "Renovação de votos e bênçãos matrimoniais",
    cor: "border-pink-500",
  },
  {
    tipo: "Ação de Graças",
    icon: <Calendar className="w-5 h-5" />,
    descricao: "Agradecimentos por graças alcançadas",
    cor: "border-green-500",
  },
  {
    tipo: "Enfermos",
    icon: <Cross className="w-5 h-5" />,
    descricao: "Orações pela saúde e recuperação",
    cor: "border-blue-500",
  },
  {
    tipo: "Falecimento",
    icon: <Users className="w-5 h-5" />,
    descricao: "Missas em sufrágio pelos entes queridos",
    cor: "border-purple-500",
  },
  {
    tipo: "Outros",
    icon: <Plus className="w-5 h-5" />,
    descricao: "Outras intenções especiais",
    cor: "border-gray-500",
  },
]

type FormState = {
  nome: string
  email: string
  telefone: string
  tipo: string
  dataPreferida: string
  intencao: string
}

const INITIAL: FormState = {
  nome: "",
  email: "",
  telefone: "",
  tipo: tiposIntencoes[0].tipo,
  dataPreferida: "",
  intencao: "",
}

export default function IntencoesContent() {
  const [form, setForm] = useState<FormState>(INITIAL)
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle")
  const [message, setMessage] = useState<string>("")

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("sending")
    setMessage("")
    try {
      const res = await fetch("/api/intencoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || "Erro ao enviar a intenção.")
      }
      setStatus("ok")
      setMessage(
        data?.emailEnviado
          ? "Sua intenção foi registrada e enviada à paróquia. Que Deus a abençoe!"
          : "Sua intenção foi registrada. A paróquia será notificada em breve.",
      )
      setForm(INITIAL)
    } catch (err) {
      setStatus("error")
      setMessage(err instanceof Error ? err.message : "Erro inesperado.")
    }
  }

  return (
    <div className="container mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-4">
          <div className="bg-yellow-500 p-4 rounded-full">
            <Heart className="w-8 h-8 text-[#0c2657]" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">Intenções de Missa</h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Envie suas intenções para que sejam lembradas durante as celebrações eucarísticas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiposIntencoes.map((intencao) => (
          <button
            type="button"
            key={intencao.tipo}
            onClick={() => update("tipo", intencao.tipo)}
            className={`text-left bg-white/10 backdrop-blur-sm rounded-lg p-4 border-l-4 ${intencao.cor} hover:bg-white/20 transition-all duration-300 ${
              form.tipo === intencao.tipo ? "ring-2 ring-yellow-500 bg-white/20" : ""
            }`}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="text-yellow-500">{intencao.icon}</div>
              <h3 className="font-semibold">{intencao.tipo}</h3>
            </div>
            <p className="text-gray-300 text-sm">{intencao.descricao}</p>
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white/5 rounded-lg p-6 space-y-4 border border-white/10"
      >
        <h2 className="text-xl font-semibold text-yellow-500">Enviar intenção</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm text-gray-300">Seu nome *</label>
            <input
              required
              minLength={2}
              value={form.nome}
              onChange={(e) => update("nome", e.target.value)}
              className="w-full rounded-md bg-[#0c2657]/60 border border-white/10 px-3 py-2 text-white outline-none focus:border-yellow-500"
              placeholder="Como devemos chamar você?"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-300">Tipo de intenção *</label>
            <select
              value={form.tipo}
              onChange={(e) => update("tipo", e.target.value)}
              className="w-full rounded-md bg-[#0c2657]/60 border border-white/10 px-3 py-2 text-white outline-none focus:border-yellow-500"
            >
              {tiposIntencoes.map((t) => (
                <option key={t.tipo} value={t.tipo}>
                  {t.tipo}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-300">E-mail (opcional)</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="w-full rounded-md bg-[#0c2657]/60 border border-white/10 px-3 py-2 text-white outline-none focus:border-yellow-500"
              placeholder="seu@email.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-300">Telefone (opcional)</label>
            <input
              type="tel"
              value={form.telefone}
              onChange={(e) => update("telefone", e.target.value)}
              className="w-full rounded-md bg-[#0c2657]/60 border border-white/10 px-3 py-2 text-white outline-none focus:border-yellow-500"
              placeholder="(00) 00000-0000"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm text-gray-300">Data preferida (opcional)</label>
            <input
              type="text"
              value={form.dataPreferida}
              onChange={(e) => update("dataPreferida", e.target.value)}
              className="w-full rounded-md bg-[#0c2657]/60 border border-white/10 px-3 py-2 text-white outline-none focus:border-yellow-500"
              placeholder="Ex.: domingo 19h, ou 20/05/2026"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm text-gray-300">Intenção *</label>
            <textarea
              required
              minLength={5}
              rows={5}
              value={form.intencao}
              onChange={(e) => update("intencao", e.target.value)}
              className="w-full rounded-md bg-[#0c2657]/60 border border-white/10 px-3 py-2 text-white outline-none focus:border-yellow-500"
              placeholder="Descreva sua intenção..."
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <p className="text-xs text-gray-400">
            Sua intenção será enviada para a secretaria paroquial.
          </p>
          <button
            type="submit"
            disabled={status === "sending"}
            className="inline-flex items-center justify-center gap-2 bg-yellow-500 text-[#0c2657] font-semibold px-5 py-2.5 rounded-md hover:bg-yellow-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {status === "sending" ? "Enviando..." : "Enviar intenção"}
          </button>
        </div>

        {status === "ok" && (
          <div className="flex items-start gap-2 bg-green-500/15 border border-green-500/30 rounded-md p-3 text-green-200">
            <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
            <p className="text-sm">{message}</p>
          </div>
        )}
        {status === "error" && (
          <div className="flex items-start gap-2 bg-red-500/15 border border-red-500/30 rounded-md p-3 text-red-200">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <p className="text-sm">{message}</p>
          </div>
        )}
      </form>

      <div className="bg-white/5 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-yellow-500">Como funciona</h3>
        <div className="space-y-2 text-gray-300 text-sm">
          <p>• Sua intenção fica registrada e é enviada à secretaria da paróquia.</p>
          <p>• Será lembrada durante a missa, conforme o calendário paroquial.</p>
          <p>• Todas as intenções são tratadas com carinho e respeito.</p>
        </div>
      </div>
    </div>
  )
}
