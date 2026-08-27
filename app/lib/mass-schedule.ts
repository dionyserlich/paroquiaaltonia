export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type MassSlot = { day: DayOfWeek; hour: number; minute: number; label: string }

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

export function findActiveMassWindow(
  now: Date = new Date(),
  schedule: MassSlot[] = MASS_SCHEDULE,
): {
  inWindow: boolean
  slot?: MassSlot
  startsAt?: Date
  endsAt?: Date
  nextSlot?: MassSlot
  nextStartsAt?: Date
} {
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
  return { inWindow: false, nextSlot: bestNext?.slot, nextStartsAt: bestNext?.startsAt }
}
