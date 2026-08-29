// Wrapper fino sobre o gtag.js instalado em app/(frontend)/layout.tsx —
// centraliza os nomes de evento/propriedade em vez de espalhar
// window.gtag(...) direto pelos componentes, e blinda contra o script ainda
// não ter carregado (afterInteractive) ou rodar em contexto sem window
// (nunca deveria, já que só é chamado de client components, mas é barato
// garantir).
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return
  window.gtag("event", name, params)
}

// Propriedades do usuário (não de um evento pontual) — precisam ser
// registradas como "Custom definitions" no painel do GA4 antes de aparecerem
// em relatórios/segmentos, mas já ficam disponíveis via Exploração assim que
// chegam. Ver https://support.google.com/analytics/answer/13316687
export function setUserProperty(name: string, value: string | number | boolean) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return
  window.gtag("set", "user_properties", { [name]: value })
}
