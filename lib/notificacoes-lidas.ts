// Marca até quando a pessoa já viu o histórico de notificações, pra saber
// quantas são novas. Fica só no navegador: o site não tem login, e guardar
// isso no servidor exigiria tratar o device_id como identidade de usuário,
// o que ele não é.
const STORAGE_KEY = "notificacoes-lidas-ate"

export function getLidasAte(): number {
  if (typeof window === "undefined") return 0
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return 0
    const valor = Number(raw)
    return Number.isFinite(valor) ? valor : 0
  } catch {
    return 0
  }
}

export function marcarTodasComoLidas(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, String(Date.now()))
  } catch {
    // localStorage indisponível — sem contador de não-lidas, mas o
    // histórico em si continua funcionando normalmente.
  }
}
