"use client"

import { useEffect } from "react"

// Registra o service worker real (public/sw.js) em toda página — necessário
// para o listener "push" existir e conseguir mostrar notificações. Substitui
// o antigo ServiceWorkerCleanup: aquele componente só desregistrava SWs
// (limpeza do kill-switch anterior); agora que sw.js tem conteúdo de verdade,
// desregistrar incondicionalmente derrubaria a própria inscrição de push a
// cada carregamento de página.
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return
    navigator.serviceWorker.register("/sw.js").catch(() => {})
  }, [])

  return null
}
