"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import "@/app/admin/admin.css"

type LogRow = {
  id: number
  ranAt: string
  trigger: string
  inWindow: boolean
  status: string
  videoId: string | null
  videoTitle: string | null
  message: string | null
}

type Status = {
  logs: LogRow[]
  current: { titulo: string | null; inicio: string | null; fim: string | null; linkEmbed: string | null; updatedAt: string | null } | null
  window: {
    inWindow: boolean
    slot: { label: string } | null
    startsAt: string | null
    endsAt: string | null
    nextSlot: { label: string } | null
    nextStartsAt: string | null
  }
}

function fmt(d: string | null) {
  if (!d) return "—"
  return new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "medium" })
}

export default function MissaBotAdminPage() {
  const [data, setData] = useState<Status | null>(null)
  const [running, setRunning] = useState(false)
  const [lastRun, setLastRun] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    try {
      const res = await fetch("/api/admin/live-mass-bot", { cache: "no-store" })
      if (res.status === 401) {
        window.location.href = "/admin/login"
        return
      }
      if (!res.ok) throw new Error(`status ${res.status}`)
      setData(await res.json())
      setError(null)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  useEffect(() => {
    load()
    const i = setInterval(load, 30000)
    return () => clearInterval(i)
  }, [])

  async function runNow() {
    setRunning(true)
    setLastRun(null)
    try {
      const res = await fetch("/api/admin/live-mass-bot", { method: "POST" })
      const json = await res.json()
      setLastRun(json)
      await load()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Bot Missa ao Vivo</h1>
          <Link href="/admin" className="admin-btn">Voltar</Link>
        </div>
      </header>
      <main className="container mx-auto p-4 space-y-6">
        {error && <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded">{error}</div>}

        <section className="admin-card">
          <h2 className="text-lg font-bold mb-3">Janela de missa</h2>
          {data ? (
            data.window.inWindow ? (
              <p className="text-green-700">
                Em janela: <strong>{data.window.slot?.label}</strong>
                <br />Início: {fmt(data.window.startsAt)} · Fim previsto: {fmt(data.window.endsAt)}
              </p>
            ) : (
              <p className="text-gray-700">
                Fora da janela. Próxima: <strong>{data.window.nextSlot?.label ?? "—"}</strong> em {fmt(data.window.nextStartsAt)}
              </p>
            )
          ) : (
            <p>Carregando…</p>
          )}
        </section>

        <section className="admin-card">
          <h2 className="text-lg font-bold mb-3">Missa ao vivo no banco</h2>
          {data?.current?.linkEmbed ? (
            <div>
              <p><strong>{data.current.titulo}</strong></p>
              <p>Início: {fmt(data.current.inicio)} · Fim: {fmt(data.current.fim)}</p>
              <p className="break-all text-sm text-gray-600">{data.current.linkEmbed}</p>
              <p className="text-xs text-gray-500">Atualizado em {fmt(data.current.updatedAt)}</p>
            </div>
          ) : (
            <p className="text-gray-600">Nenhuma missa ao vivo no momento.</p>
          )}
        </section>

        <section className="admin-card">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold">Execução manual</h2>
            <button onClick={runNow} disabled={running} className="admin-btn admin-btn-primary">
              {running ? "Rodando…" : "Rodar agora"}
            </button>
          </div>
          {lastRun && (
            <pre className="bg-gray-100 p-3 text-xs overflow-x-auto rounded">{JSON.stringify(lastRun, null, 2)}</pre>
          )}
        </section>

        <section className="admin-card">
          <h2 className="text-lg font-bold mb-3">Últimas execuções</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Quando</th>
                  <th>Origem</th>
                  <th>Janela</th>
                  <th>Status</th>
                  <th>Vídeo</th>
                  <th>Mensagem</th>
                </tr>
              </thead>
              <tbody>
                {(data?.logs ?? []).map((l) => (
                  <tr key={l.id} className="border-b">
                    <td className="py-2 whitespace-nowrap">{fmt(l.ranAt)}</td>
                    <td>{l.trigger}</td>
                    <td>{l.inWindow ? "sim" : "não"}</td>
                    <td>
                      <span
                        className={
                          l.status === "live_found"
                            ? "text-green-700"
                            : l.status === "error"
                            ? "text-red-700"
                            : "text-gray-700"
                        }
                      >
                        {l.status}
                      </span>
                    </td>
                    <td>{l.videoTitle ?? "—"}</td>
                    <td className="text-xs">{l.message ?? "—"}</td>
                  </tr>
                ))}
                {(!data || data.logs.length === 0) && (
                  <tr><td colSpan={6} className="py-3 text-gray-500">Nenhuma execução registrada.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}
