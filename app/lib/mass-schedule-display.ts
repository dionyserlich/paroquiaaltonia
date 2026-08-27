type HorarioEntry = { diaSemana: string; hora: number; minuto: number; label?: string | null }

const DIAS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"]

function formatHora(hora: number, minuto: number) {
  return `${String(hora).padStart(2, "0")}h${String(minuto).padStart(2, "0")}`
}

// Agrupa a grade semanal (fonte: global MassSchedule) num formato de exibição
// simples: uma linha por dia, ou "Segunda à sexta-feira" quando os 5 dias
// úteis têm exatamente os mesmos horários (caso comum, evita repetir 5x).
export function groupMassScheduleForDisplay(horarios: HorarioEntry[]) {
  const byDay = new Map<number, string[]>()
  for (const h of horarios) {
    const dia = Number(h.diaSemana)
    const lista = byDay.get(dia) || []
    lista.push(formatHora(h.hora, h.minuto))
    byDay.set(dia, lista)
  }
  for (const [, lista] of byDay) lista.sort()

  const uteis = [1, 2, 3, 4, 5].map((d) => (byDay.get(d) || []).join("|"))
  const uteisIguais = uteis.every((v) => v === uteis[0]) && uteis[0] !== ""

  const linhas: { label: string; horarios: string }[] = []
  if (uteisIguais) {
    linhas.push({ label: "Segunda à sexta-feira", horarios: (byDay.get(1) || []).join(" | ") })
  } else {
    for (const d of [1, 2, 3, 4, 5]) {
      if (byDay.get(d)?.length) linhas.push({ label: DIAS[d], horarios: byDay.get(d)!.join(" | ") })
    }
  }
  if (byDay.get(6)?.length) linhas.push({ label: "Sábado", horarios: byDay.get(6)!.join(" | ") })
  if (byDay.get(0)?.length) linhas.push({ label: "Domingo", horarios: byDay.get(0)!.join(" | ") })

  return linhas
}
