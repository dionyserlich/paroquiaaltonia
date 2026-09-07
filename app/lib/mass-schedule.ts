export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type MassSlot = { day: DayOfWeek; hour: number; minute: number; label: string }

// Missa avulsa, numa data específica, fora da grade semanal — feriado,
// festa da padroeira, encerramento de encontro. Diferente de MassSlot, que
// se repete toda semana, esta acontece uma vez só, então é identificada por
// um instante absoluto em vez de dia-da-semana + hora.
export type MassSpecial = { at: Date; label: string }

// Fallback só para o caso raro de o Global MassSchedule do Payload estar
// vazio/indisponível — a fonte de verdade real é o Payload (ver
// app/lib/live-mass-bot.ts), não esta constante.
export const MASS_SCHEDULE: MassSlot[] = [
  { day: 1, hour: 7, minute: 30, label: "Missa de segunda 07h30" },
  { day: 2, hour: 7, minute: 30, label: "Missa de terça 07h30" },
  { day: 3, hour: 7, minute: 30, label: "Missa de quarta 07h30" },
  { day: 4, hour: 7, minute: 30, label: "Missa de quinta 07h30" },
  { day: 5, hour: 7, minute: 30, label: "Missa de sexta 07h30" },
  { day: 1, hour: 20, minute: 0, label: "Missa de segunda 20h00" },
  { day: 2, hour: 20, minute: 0, label: "Missa de terça 20h00" },
  { day: 3, hour: 20, minute: 0, label: "Missa de quarta 20h00" },
  { day: 4, hour: 20, minute: 0, label: "Missa de quinta 20h00" },
  { day: 5, hour: 20, minute: 0, label: "Missa de sexta 20h00" },
  { day: 6, hour: 20, minute: 0, label: "Missa de sábado 20h00" },
  { day: 0, hour: 8, minute: 30, label: "Missa de domingo 08h30" },
  { day: 0, hour: 10, minute: 30, label: "Missa de domingo 10h30" },
  { day: 0, hour: 18, minute: 0, label: "Missa de domingo 18h00" },
]

export const PRE_WINDOW_MIN = 30
export const POST_WINDOW_MIN = 90

// Extrai o horário de Brasília via Intl com timeZone explícito — não depende
// do fuso do processo/SO que roda o código (o truque anterior, baseado em
// getTimezoneOffset(), só funcionava corretamente se o servidor já rodasse
// em UTC; local, ou em qualquer ambiente com TZ diferente, dava até 3h de
// erro — bug real encontrado ao testar esta fase).
const BRT_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Sao_Paulo",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
})
const WEEKDAY_INDEX: Record<string, DayOfWeek> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }

function brtDayAndMinutes(now: Date): { day: DayOfWeek; minutesNow: number } {
  const parts = BRT_FORMATTER.formatToParts(now)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ""
  const day = WEEKDAY_INDEX[get("weekday")]
  const minutesNow = Number(get("hour")) * 60 + Number(get("minute"))
  return { day, minutesNow }
}

// Converte uma missa avulsa para o formato de slot só para a resposta —
// dia/hora/minuto ficam corretos para aquela ocorrência específica, o que é
// tudo que quem consome usa (basicamente o label).
function slotDeEspecial(especial: MassSpecial): MassSlot {
  const { day, minutesNow } = brtDayAndMinutes(especial.at)
  return {
    day,
    hour: Math.floor(minutesNow / 60),
    minute: minutesNow % 60,
    label: especial.label,
  }
}

export function findActiveMassWindow(
  now: Date = new Date(),
  schedule: MassSlot[] = MASS_SCHEDULE,
  especiais: MassSpecial[] = [],
): {
  inWindow: boolean
  slot?: MassSlot
  startsAt?: Date
  endsAt?: Date
  nextSlot?: MassSlot
  nextStartsAt?: Date
} {
  const agora = now.getTime()

  // Missas avulsas são verificadas antes e por tempo absoluto: como têm data
  // própria, não passam pela aritmética de dia-da-semana abaixo (que é o que
  // faz uma missa de feriado, fora da grade, nunca ser encontrada).
  for (const especial of especiais) {
    const inicio = especial.at.getTime() - PRE_WINDOW_MIN * 60000
    const fim = especial.at.getTime() + POST_WINDOW_MIN * 60000
    if (agora >= inicio && agora <= fim) {
      return {
        inWindow: true,
        slot: slotDeEspecial(especial),
        startsAt: especial.at,
        endsAt: new Date(fim),
      }
    }
  }

  const { day, minutesNow } = brtDayAndMinutes(now)

  const candidates = schedule.flatMap((slot) => {
    const offsets = slot.day === day ? [0] : []
    if ((slot.day - day + 7) % 7 === 1) offsets.push(1)
    return offsets.map((off) => ({ slot, dayOffset: off }))
  })

  for (const { slot, dayOffset } of candidates) {
    const slotMinutes = dayOffset * 24 * 60 + slot.hour * 60 + slot.minute
    const start = slotMinutes - PRE_WINDOW_MIN
    const end = slotMinutes + POST_WINDOW_MIN
    if (minutesNow >= start && minutesNow <= end) {
      const startsAt = new Date(now.getTime() + (slotMinutes - minutesNow) * 60000)
      const endsAt = new Date(startsAt.getTime() + POST_WINDOW_MIN * 60000)
      return { inWindow: true, slot, startsAt, endsAt }
    }
  }

  let bestNext: { slot: MassSlot; startsAt: Date } | null = null
  for (const slot of schedule) {
    let dayOffset = (slot.day - day + 7) % 7
    const slotMinutes = slot.hour * 60 + slot.minute
    if (dayOffset === 0 && slotMinutes <= minutesNow) dayOffset = 7
    const totalMinutes = dayOffset * 24 * 60 + slotMinutes
    const startsAt = new Date(now.getTime() + (totalMinutes - minutesNow) * 60000)
    if (!bestNext || startsAt < bestNext.startsAt) bestNext = { slot, startsAt }
  }

  // Uma missa avulsa ainda por vir pode ser a próxima — inclusive antes da
  // próxima da grade semanal. Datas já passadas são ignoradas, então sobras
  // antigas no cadastro não atrapalham.
  for (const especial of especiais) {
    if (especial.at.getTime() <= agora) continue
    if (!bestNext || especial.at < bestNext.startsAt) {
      bestNext = { slot: slotDeEspecial(especial), startsAt: especial.at }
    }
  }

  return { inWindow: false, nextSlot: bestNext?.slot, nextStartsAt: bestNext?.startsAt }
}
