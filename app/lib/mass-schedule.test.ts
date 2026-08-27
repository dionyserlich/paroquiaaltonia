import { describe, expect, it } from "vitest"
import { findActiveMassWindow, type MassSlot } from "./mass-schedule"

// BRT é UTC-3 fixo (sem horário de verão no Brasil desde 2019) — helper só
// pra deixar os casos de teste legíveis em horário de Brasília em vez de UTC.
function brt(year: number, month: number, day: number, hour: number, minute = 0): Date {
  return new Date(Date.UTC(year, month - 1, day, hour + 3, minute))
}

// Domingo(2026-08-30)=0, segunda(2026-08-31)=1 — usado nos testes de virada
// de semana.
const SCHEDULE: MassSlot[] = [
  { day: 1, hour: 20, minute: 0, label: "Missa de segunda 20h00" },
  { day: 0, hour: 18, minute: 0, label: "Missa de domingo 18h00" },
]

describe("findActiveMassWindow", () => {
  it("está fora da janela 31 min antes do horário", () => {
    const result = findActiveMassWindow(brt(2026, 8, 31, 19, 29), SCHEDULE)
    expect(result.inWindow).toBe(false)
  })

  it("entra na janela exatamente 30 min antes do horário", () => {
    const result = findActiveMassWindow(brt(2026, 8, 31, 19, 30), SCHEDULE)
    expect(result.inWindow).toBe(true)
    expect(result.slot?.label).toBe("Missa de segunda 20h00")
  })

  it("está na janela exatamente no horário da missa", () => {
    const result = findActiveMassWindow(brt(2026, 8, 31, 20, 0), SCHEDULE)
    expect(result.inWindow).toBe(true)
  })

  it("está na janela no meio do período (45 min depois do início)", () => {
    const result = findActiveMassWindow(brt(2026, 8, 31, 20, 45), SCHEDULE)
    expect(result.inWindow).toBe(true)
  })

  it("ainda está na janela exatamente 90 min depois (fechamento, inclusive)", () => {
    const result = findActiveMassWindow(brt(2026, 8, 31, 21, 30), SCHEDULE)
    expect(result.inWindow).toBe(true)
  })

  it("sai da janela 1 min depois do fechamento", () => {
    const result = findActiveMassWindow(brt(2026, 8, 31, 21, 31), SCHEDULE)
    expect(result.inWindow).toBe(false)
  })

  it("na virada de domingo pra segunda, aponta a próxima missa como a de segunda", () => {
    // Domingo 23h — bem depois da janela da missa de domingo 18h (fecha 19h30).
    const result = findActiveMassWindow(brt(2026, 8, 30, 23, 0), SCHEDULE)
    expect(result.inWindow).toBe(false)
    expect(result.nextSlot?.label).toBe("Missa de segunda 20h00")
    // Deve apontar pra segunda-feira 20h, não pra domingo de novo.
    expect(result.nextStartsAt?.toISOString()).toBe(brt(2026, 8, 31, 20, 0).toISOString())
  })
})
