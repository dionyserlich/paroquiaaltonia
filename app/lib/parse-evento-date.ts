// Extraído de scripts/migrate-to-payload.ts pra ser testável isoladamente —
// converte os campos soltos do schema antigo de eventos (dia/mes em texto ou
// número/ano/hora) num Date real. Mesma regra de sempre: BRT fixo (UTC-3).
const MESES: Record<string, string> = {
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

export function parseEventoStartAt(mes: string, dia: string | number, ano: string | number, hora: string): Date {
  const mesNumero = /^\d+$/.test(mes) ? mes.padStart(2, "0") : MESES[mes]
  if (!mesNumero) throw new Error(`mês não reconhecido: "${mes}"`)

  const horaLimpa = String(hora).replace(/[^\d:]/g, "")
  const diaFormatado = String(dia).padStart(2, "0")

  const startAt = new Date(`${ano}-${mesNumero}-${diaFormatado}T${horaLimpa}:00-03:00`)
  if (isNaN(startAt.getTime())) {
    throw new Error(`data inválida: ${ano}-${mesNumero}-${diaFormatado}T${horaLimpa}`)
  }
  return startAt
}
