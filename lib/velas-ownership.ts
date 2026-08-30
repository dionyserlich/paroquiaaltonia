// Guarda quais velas a pessoa acendeu neste navegador, sem precisar de
// login — a "posse" é só o par {id, token} salvo aqui. Não existe nenhum
// wrapper de localStorage no projeto ainda (só welcome-banner.tsx usa,
// direto e inline); este arquivo estabelece o padrão pra esta feature.
const STORAGE_KEY = "velas-minhas"

export type VelaOwnership = { id: number; token: string }

export function getMinhasVelas(): VelaOwnership[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (v): v is VelaOwnership => typeof v?.id === "number" && typeof v?.token === "string"
    )
  } catch {
    return []
  }
}

export function salvarVelaOwnership(id: number, token: string): void {
  if (typeof window === "undefined") return
  const atuais = getMinhasVelas().filter((v) => v.id !== id)
  atuais.push({ id, token })
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(atuais))
  } catch {
    // localStorage indisponível (modo privado restrito etc.) — sem
    // fallback, a pessoa só não vai conseguir apagar/editar depois.
  }
}

export function removerVelaOwnership(id: number): void {
  if (typeof window === "undefined") return
  const atuais = getMinhasVelas().filter((v) => v.id !== id)
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(atuais))
  } catch {
    // Ver comentário em salvarVelaOwnership.
  }
}

export function getTokenParaVela(id: number): string | null {
  return getMinhasVelas().find((v) => v.id === id)?.token ?? null
}
