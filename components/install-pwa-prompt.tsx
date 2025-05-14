"use client"

import { useState, useEffect, useRef } from "react"
import { Download, X, Share } from "lucide-react"

export default function InstallPwaPrompt() {
  const [isVisible, setIsVisible] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const deferredPromptRef = useRef<any>(null)

  useEffect(() => {
    // Verificar se o usuário já fechou o aviso antes
    const hasClosedPrompt = localStorage.getItem("pwa-prompt-closed")
    if (hasClosedPrompt === "true") {
      return
    }

    // Detectar se é iOS
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    setIsIOS(isIOSDevice)

    // Verificar se o app já está instalado
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true

    if (isStandalone) {
      return // App já está instalado, não mostrar o aviso
    }

    // Capturar o evento beforeinstallprompt para Android/Chrome
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault()
      deferredPromptRef.current = e
      setIsVisible(true)

      // Adicionar classe ao body quando o aviso estiver visível
      document.body.classList.add("has-install-prompt")
    })

    // Para iOS, mostrar o aviso diretamente
    if (isIOSDevice) {
      setIsVisible(true)

      // Adicionar classe ao body quando o aviso estiver visível
      document.body.classList.add("has-install-prompt")
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", (e) => {
        e.preventDefault()
      })

      // Remover classe do body quando o componente for desmontado
      document.body.classList.remove("has-install-prompt")
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    localStorage.setItem("pwa-prompt-closed", "true")

    // Remover classe do body quando o aviso for fechado
    document.body.classList.remove("has-install-prompt")
  }

  const handleInstall = async () => {
    if (isIOS) {
      // No iOS, apenas mostrar instruções
      return
    }

    if (deferredPromptRef.current) {
      try {
        await deferredPromptRef.current.prompt()
        const choiceResult = await deferredPromptRef.current.userChoice

        if (choiceResult.outcome === "accepted") {
          console.log("Usuário aceitou a instalação do PWA")
          setIsVisible(false)
          localStorage.setItem("pwa-prompt-closed", "true")

          // Remover classe do body quando o app for instalado
          document.body.classList.remove("has-install-prompt")
        }

        deferredPromptRef.current = null
      } catch (error) {
        console.error("Erro ao tentar instalar o PWA:", error)
      }
    }
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className={`install-prompt bg-yellow-500 text-black px-4 py-3 shadow-md ${!isVisible ? "hidden" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {isIOS ? <Share className="mr-2 h-5 w-5" /> : <Download className="mr-2 h-5 w-5" />}
          <span className="text-sm font-medium">
            {isIOS ? "Adicione à tela inicial para melhor experiência" : "Instale nosso app para melhor experiência"}
          </span>
        </div>
        <div className="flex items-center">
          {!isIOS && (
            <button
              onClick={handleInstall}
              className="mr-2 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
            >
              Instalar
            </button>
          )}
          <button onClick={handleClose} className="text-gray-800 hover:text-black" aria-label="Fechar">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
