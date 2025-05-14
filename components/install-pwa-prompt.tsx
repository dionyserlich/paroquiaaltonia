"use client"

import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"

export default function InstallPwaPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const deferredPrompt = useRef<any>(null)

  useEffect(() => {
    // Verificar se o usuário já fechou o prompt antes
    const promptDismissed = localStorage.getItem("pwaPromptDismissed")

    // Verificar se está sendo executado como PWA instalado
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://")

    // Detectar iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(iOS)

    // Se o usuário não fechou o prompt e não está no modo standalone
    if (!promptDismissed && !isStandalone) {
      // Para Android/Chrome
      window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault()
        deferredPrompt.current = e
        setShowPrompt(true)
      })

      // Para iOS (sempre mostrar, pois não há evento de instalação)
      if (iOS) {
        setShowPrompt(true)
      }
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt.current) {
      // Para Android/Chrome
      deferredPrompt.current.prompt()
      const { outcome } = await deferredPrompt.current.userChoice
      console.log(`Resultado da instalação: ${outcome}`)
      deferredPrompt.current = null
      setShowPrompt(false)
    }
  }

  const dismissPrompt = () => {
    localStorage.setItem("pwaPromptDismissed", "true")
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div className="absolute top-0 left-0 right-0 z-50000 bg-blue-600 text-white p-3 flex items-center justify-between shadow-md">
      <div className="flex-1">
        {isIOS ? (
          <p className="text-sm">
            Instale nosso app: toque em{" "}
            <span className="inline-block">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </span>{" "}
            e depois "Adicionar à Tela de Início"
          </p>
        ) : (
          <p className="text-sm">Instale nosso app para uma experiência melhor</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {!isIOS && (
          <button onClick={handleInstall} className="bg-white text-blue-600 px-3 py-1 rounded-md text-sm font-medium">
            Instalar
          </button>
        )}
        <button onClick={dismissPrompt} className="text-white p-1 rounded-full hover:bg-blue-700" aria-label="Fechar">
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
