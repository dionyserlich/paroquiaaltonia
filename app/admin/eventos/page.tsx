"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import DeployStatus from "@/components/deploy-status"
import "@/app/admin/admin.css"

export default function AdminEventos() {
  const [eventos, setEventos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [commitSha, setCommitSha] = useState<string | undefined>(undefined)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadEventos() {
      try {
        const res = await fetch("/api/proximos-eventos?incluirPassados=true")
        if (!res.ok) throw new Error("Falha ao carregar eventos")
        const data = await res.json()

        // Função para converter data do evento para objeto Date
        const getEventoDate = (evento: any) => {
          try {
            // Converter mês de texto para número
            const meses: Record<string, string> = {
              Janeiro: "01",
              Fevereiro: "02",
              Março: "03",
              Abril: "04",
              Maio: "05",
              Junho: "06",
              Julho: "07",
              Agosto: "08",
              Setembro: "09",
              Outubro: "10",
              Novembro: "11",
              Dezembro: "12",
            }

            let mesNumero = evento.mes
            if (isNaN(Number.parseInt(evento.mes))) {
              mesNumero = meses[evento.mes] || "01"
            }

            // Extrair apenas a hora e minuto do formato de hora (ex: "20:30h" -> "20:30")
            const hora = evento.hora.replace(/[^\d:]/g, "")

            // Criar objeto Date usando UTC para evitar problemas de fuso horário
            const dataString = `${evento.ano}-${mesNumero}-${evento.dia}T${hora}:00`
            const dataEvento = new Date(dataString)

            // Ajustar para o fuso horário local do Brasil (UTC-3)
            const dataAjustada = new Date(dataEvento.getTime() + 3 * 60 * 60 * 1000)

            return dataAjustada
          } catch (error) {
            console.error(`Erro ao processar data do evento ${evento.id}:`, error)
            return new Date(0) // Data mínima em caso de erro
          }
        }

        // Ordenar eventos por data (mais recente primeiro)
        const sortedEventos = [...data].sort((a, b) => {
          const dataA = getEventoDate(a)
          const dataB = getEventoDate(b)
          return dataB.getTime() - dataA.getTime() // Ordem decrescente de data (mais recente primeiro)
        })

        setEventos(sortedEventos)
      } catch (err) {
        setError("Erro ao carregar eventos")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadEventos()
  }, [])

  async function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja excluir este evento?")) return

    try {
      setDeletingId(id)
      setCommitSha(undefined)

      const res = await fetch(`/api/admin/eventos/${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        const data = await res.json()

        // Remover o evento da lista
        setEventos(eventos.filter((evento) => evento.id !== id))

        // Se a resposta incluir informações do commit, mostrar o status do deploy
        if (data._commit && data._commit.sha) {
          setCommitSha(data._commit.sha)
        }
      } else {
        setError("Erro ao excluir evento")
        setDeletingId(null)
      }
    } catch (err) {
      setError("Erro ao excluir evento")
      console.error(err)
      setDeletingId(null)
    }
  }

  function handleDeployComplete() {
    setCommitSha(undefined)
    setDeletingId(null)
  }

  if (loading) return <div className="admin-page p-4">Carregando...</div>

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Gerenciar Eventos</h1>
          <Link href="/admin" className="admin-btn admin-btn-primary">
            Voltar
          </Link>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {error && <div className="admin-alert admin-alert-error">{error}</div>}

        {commitSha && <DeployStatus commitSha={commitSha} onDeployComplete={handleDeployComplete} />}

        <div className="flex justify-end mb-4">
          <Link href="/admin/eventos/novo" className="admin-btn admin-btn-success">
            Novo Evento
          </Link>
        </div>

        <div className="admin-card overflow-hidden">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Data</th>
                <th>Hora</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {eventos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-gray-500">
                    Nenhum evento cadastrado
                  </td>
                </tr>
              ) : (
                eventos.map((evento) => (
                  <tr key={evento.id}>
                    <td>{evento.titulo}</td>
                    <td>
                      {evento.dia} de {evento.mes} de {evento.ano}
                    </td>
                    <td>{evento.hora}</td>
                    <td className="text-right">
                      <Link href={`/admin/eventos/${evento.id}`} className="admin-link mr-4">
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(evento.id)}
                        className="text-red-600 hover:text-red-800"
                        disabled={deletingId === evento.id}
                      >
                        {deletingId === evento.id ? "Excluindo..." : "Excluir"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
