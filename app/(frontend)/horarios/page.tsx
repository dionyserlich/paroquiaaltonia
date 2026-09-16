import Header from "@/components/header"
import ConteudoIndisponivel from "@/components/conteudo-indisponivel"
import BottomNavbar from "@/components/bottom-navbar"
import HorariosContent from "./horarios-content"
import PageClient from "../page-client"
import { payloadClient } from "@/app/lib/payload"

export const metadata = {
  title: "Horários",
  alternates: { canonical: "/horarios" },
  description:
    "Confira os horários das missas, atendimento da secretaria, confissões e contatos da Paróquia São Sebastião de Altônia",
  openGraph: {
    title: "Horários",
    description:
      "Confira os horários das missas, atendimento da secretaria, confissões e contatos da Paróquia São Sebastião de Altônia",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Horários",
    description:
      "Confira os horários das missas, atendimento da secretaria, confissões e contatos da Paróquia São Sebastião de Altônia",
  },
}

// Sem isso, Next trata esta página como estática (nenhuma API dinâmica é
// chamada aqui) e congela o resultado dos payload.findGlobal no build —
// edições feitas depois via CMS nunca aparecem até o próximo deploy.
export const dynamic = "force-dynamic"

export default async function HorariosPage() {
  // Busca isolada num IIFE com catch: o JSX precisa ficar FORA do
  // try, porque React só renderiza depois e um try/catch em volta do
  // return não capturaria erro nenhum de renderização.
  const dados = await (async () => {
    try {
      const payload = await payloadClient()
      const [massSchedule, horarios, contactInfo] = await Promise.all([
        payload.findGlobal({ slug: "mass-schedule" }),
        payload.findGlobal({ slug: "horarios" }),
        payload.findGlobal({ slug: "contact-info" }),
      ])
      return { ok: true as const, massSchedule, horarios, contactInfo }
    } catch (err) {
      console.error("[horarios] banco indisponível:", err)
      return { ok: false as const }
    }
  })()
  if (!dados.ok) return <ConteudoIndisponivel titulo="Horários" />
  const { massSchedule, horarios, contactInfo } = dados

  return (
    <PageClient>
      <main className="flex min-h-screen flex-col bg-parish-bg">
        <Header />
        <h1 className="text-2xl font-bold text-white mb-6 text-center mt-10">Horários</h1>
        <div className="z-20 page-no-hero">
          <div className="container mx-auto px-4 py-6">
            <HorariosContent
              horariosMissas={
                (massSchedule.horarios || []) as {
                  diaSemana: string
                  hora: number
                  minuto: number
                  label?: string | null
                }[]
              }
              missasEspeciais={(horarios.missasEspeciais || []) as { descricao: string; horario: string }[]}
              horarioSecretaria={horarios.horarioSecretaria}
              atendimentoPadres={horarios.atendimentoPadres}
              confissoes={horarios.confissoes}
              observacao={horarios.observacao}
              contato={contactInfo}
            />
          </div>
        </div>

        <BottomNavbar />
      </main>
    </PageClient>
  )
}
