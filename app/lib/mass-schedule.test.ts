import { describe, expect, it } from "vitest"
import { findActiveMassWindow, type MassSlot, type MassSpecial } from "./mass-schedule"

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

// Missas avulsas, fora da grade semanal. O caso real que motivou isto: em
// 7/9/2026 (segunda, feriado) houve missa às 18h e o bot não procurou a
// transmissão, porque 18h só existe no horário de domingo.
describe("findActiveMassWindow com missas especiais", () => {
  const ESPECIAL: MassSpecial[] = [
    { at: brt(2026, 9, 7, 18, 0), label: "Missa de 7 de setembro" },
  ]

  it("entra na janela de uma missa especial num dia sem missa na grade", () => {
    const result = findActiveMassWindow(brt(2026, 9, 7, 18, 42), SCHEDULE, ESPECIAL)
    expect(result.inWindow).toBe(true)
    expect(result.slot?.label).toBe("Missa de 7 de setembro")
  })

  it("respeita os mesmos 30 min de antecedência das missas fixas", () => {
    expect(findActiveMassWindow(brt(2026, 9, 7, 17, 29), SCHEDULE, ESPECIAL).inWindow).toBe(false)
    expect(findActiveMassWindow(brt(2026, 9, 7, 17, 30), SCHEDULE, ESPECIAL).inWindow).toBe(true)
  })

  it("respeita os mesmos 90 min de tolerância no fim", () => {
    const noFim = findActiveMassWindow(brt(2026, 9, 7, 19, 30), SCHEDULE, ESPECIAL)
    expect(noFim.inWindow).toBe(true)
    expect(noFim.slot?.label).toBe("Missa de 7 de setembro")

    // Um minuto depois a janela da especial fechou. Segue "inWindow" porque
    // às 19h31 já abriu a antecedência da missa fixa de segunda 20h — o que
    // importa aqui é que não é mais a especial que está segurando a janela.
    const depois = findActiveMassWindow(brt(2026, 9, 7, 19, 31), SCHEDULE, ESPECIAL)
    expect(depois.slot?.label).toBe("Missa de segunda 20h00")
  })

  it("sem missas especiais, o mesmo instante fica fora da janela", () => {
    // Confirma que o comportamento antigo não mudou: é a especial que faz a
    // diferença, não uma frouxidão nova na regra.
    expect(findActiveMassWindow(brt(2026, 9, 7, 18, 42), SCHEDULE).inWindow).toBe(false)
  })

  it("aponta a missa especial como próxima quando ela vem antes da grade", () => {
    // Segunda 08h: pela grade, a próxima seria a de segunda 20h.
    const result = findActiveMassWindow(brt(2026, 9, 7, 8, 0), SCHEDULE, ESPECIAL)
    expect(result.inWindow).toBe(false)
    expect(result.nextSlot?.label).toBe("Missa de 7 de setembro")
    expect(result.nextStartsAt?.toISOString()).toBe(brt(2026, 9, 7, 18, 0).toISOString())
  })

  it("ignora missas especiais já passadas ao calcular a próxima", () => {
    const passada: MassSpecial[] = [{ at: brt(2020, 1, 1, 10, 0), label: "Missa antiga" }]
    const result = findActiveMassWindow(brt(2026, 8, 30, 23, 0), SCHEDULE, passada)
    expect(result.nextSlot?.label).toBe("Missa de segunda 20h00")
  })

  it("descarta datas inválidas sem quebrar", () => {
    const invalida: MassSpecial[] = [{ at: new Date("nao-e-data"), label: "Quebrada" }]
    expect(() => findActiveMassWindow(brt(2026, 9, 7, 18, 42), SCHEDULE, invalida)).not.toThrow()
    expect(findActiveMassWindow(brt(2026, 9, 7, 18, 42), SCHEDULE, invalida).inWindow).toBe(false)
  })
})
