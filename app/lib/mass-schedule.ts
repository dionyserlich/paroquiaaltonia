export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type MassSlot = { day: DayOfWeek; hour: number; minute: number; label: string }

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

const TZ_OFFSET_MIN = -180

export const PRE_WINDOW_MIN = 30
export const POST_WINDOW_MIN = 90

function brtNow(now: Date = new Date()) {
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  return new Date(utc + TZ_OFFSET_MIN * 60000)
}

export function findActiveMassWindow(now: Date = new Date()): {
  inWindow: boolean
  slot?: MassSlot
  startsAt?: Date
  endsAt?: Date
  nextSlot?: MassSlot
  nextStartsAt?: Date
} {
  const local = brtNow(now)
  const day = local.getUTCDay() as DayOfWeek
  const minutesNow = local.getUTCHours() * 60 + local.getUTCMinutes()

  const candidates = MASS_SCHEDULE.flatMap((slot) => {
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
  for (const slot of MASS_SCHEDULE) {
    let dayOffset = (slot.day - day + 7) % 7
    const slotMinutes = slot.hour * 60 + slot.minute
    if (dayOffset === 0 && slotMinutes <= minutesNow) dayOffset = 7
    const totalMinutes = dayOffset * 24 * 60 + slotMinutes
    const startsAt = new Date(now.getTime() + (totalMinutes - minutesNow) * 60000)
    if (!bestNext || startsAt < bestNext.startsAt) bestNext = { slot, startsAt }
  }
  return { inWindow: false, nextSlot: bestNext?.slot, nextStartsAt: bestNext?.startsAt }
}
