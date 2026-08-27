import { describe, expect, it } from "vitest"
import { parseEventoStartAt } from "./parse-evento-date"

describe("parseEventoStartAt", () => {
  it("aceita mês por nome em português", () => {
    const d = parseEventoStartAt("Maio", "31", "2025", "20:00")
    expect(d.toISOString()).toBe("2025-05-31T23:00:00.000Z") // 20h BRT = 23h UTC
  })

  it("aceita mês já numérico", () => {
    const d = parseEventoStartAt("5", "31", "2025", "20:00")
    expect(d.toISOString()).toBe("2025-05-31T23:00:00.000Z")
  })

  it("preenche dia com zero à esquerda quando vem como número solto", () => {
    const d = parseEventoStartAt("Maio", 5, "2025", "20:00")
    expect(d.getUTCDate()).toBe(5)
  })

  it("limpa sufixos soltos no horário (ex.: 'h' ou 'hrs')", () => {
    const d = parseEventoStartAt("Maio", "31", "2025", "20:00hrs")
    expect(d.toISOString()).toBe("2025-05-31T23:00:00.000Z")
  })

  it("lança erro pra mês não reconhecido", () => {
    expect(() => parseEventoStartAt("Mêsinventado", "31", "2025", "20:00")).toThrow(/mês não reconhecido/)
  })

  it("lança erro pra data inválida (ex.: dia 32)", () => {
    expect(() => parseEventoStartAt("Maio", "32", "2025", "20:00")).toThrow(/data inválida/)
  })
})
