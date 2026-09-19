import Link from "next/link"
import type { Evento } from "@/app/lib/content-types"

// Componente de SERVIDOR — ver a explicação em components/news-list.tsx:
// buscar no navegador deixava o HTML da home sem um único nome de evento,
// e o Google não indexa o que não vê sem executar JavaScript.
export default function EventsList({ eventos }: { eventos: Evento[] }) {

  if (eventos.length === 0) {
    return (
      <div className="p-4 text-center text-white">
        <p>Nenhum evento programado no momento.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {eventos.map((evento) => {
        const data = new Date(evento.startAt)
        const dia = data.toLocaleDateString("pt-BR", { day: "2-digit", timeZone: "America/Sao_Paulo" })
        const mes = data.toLocaleDateString("pt-BR", { month: "short", timeZone: "America/Sao_Paulo" }).replace(".", "")
        const hora = data.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "America/Sao_Paulo",
        })
        return (
          <Link href={`/eventos/${evento.slug}`} key={evento.id} className="block bg-parish-card p-3 rounded-lg">
            <div className="flex items-start">
              <div className="text-yellow-500 font-bold mr-3 text-center min-w-[60px]">
                <div className="text-[16pt]">{dia}</div>
                <div className="text-xs capitalize">{mes}</div>
              </div>
              <div>
                <div className="text-white text-sm">{hora}</div>
                <div className="text-yellow-500 font-medium">{evento.titulo}</div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
