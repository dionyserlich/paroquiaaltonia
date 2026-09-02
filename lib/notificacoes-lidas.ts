// Marca até quando a pessoa já viu o histórico de notificações, pra saber
// quantas são novas. Fica só no navegador: o site não tem login, e guardar
// isso no servidor exigiria tratar o device_id como identidade de usuário,
// o que ele não é.
const STORAGE_KEY = "notificacoes-lidas-ate"
const PRIMEIRO_ACESSO_KEY = "notificacoes-primeiro-acesso"

// Momento em que este navegador viu o site pela primeira vez. O histórico
// começa daqui: um aviso enviado antes da pessoa existir como visitante não
// é dela, e mostrar tudo o que já foi anunciado faria quem chega agora abrir
// o sino com dezenas de itens "novos" que nunca perdeu. É como funciona
// qualquer caixa de notificações — ela começa quando você entra.
export function getPrimeiroAcesso(): number {
  if (typeof window === "undefined") return 0
  try {
    const salvo = window.localStorage.getItem(PRIMEIRO_ACESSO_KEY)
    if (salvo) {
      const valor = Number(salvo)
      if (Number.isFinite(valor)) return valor
    }
    const agora = Date.now()
    window.localStorage.setItem(PRIMEIRO_ACESSO_KEY, String(agora))
    return agora
  } catch {
    // Sem localStorage não dá pra saber quando foi a primeira visita.
    // Devolver 0 mantém o comportamento antigo (mostra o histórico
    // disponível) em vez de esconder tudo.
    return 0
  }
}

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
