// Identidade estável deste navegador, só pra reconhecer que uma inscrição
// push nova substitui uma antiga do MESMO aparelho. Não identifica a pessoa
// e não é enviada pra lugar nenhum além da própria inscrição push.
//
// Motivo de existir: o Android troca o endpoint da inscrição por conta
// própria de tempos em tempos (renovação de token do FCM, atualização do
// Play Services, despejo de armazenamento). Sem uma âncora por aparelho, a
// linha antiga fica órfã no banco e o envio some no vazio — o FCM aceita
// com 201 e não entrega —, obrigando a desativar e reativar o sino na mão.
const STORAGE_KEY = "device-id"

export function getDeviceId(): string | null {
  if (typeof window === "undefined") return null
  try {
    const existente = window.localStorage.getItem(STORAGE_KEY)
    if (existente) return existente
    const novo = crypto.randomUUID()
    window.localStorage.setItem(STORAGE_KEY, novo)
    return novo
  } catch {
    // localStorage indisponível (modo privado restrito etc.) — segue sem
    // deviceId; a inscrição ainda é gravada, só não dá pra podar a antiga.
    return null
  }
}
