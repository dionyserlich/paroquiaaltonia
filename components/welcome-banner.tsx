"use client"

import { useEffect, useRef, useState } from "react"
import { Download, Share, X, BellRing } from "lucide-react"
import { usePushSubscription } from "@/hooks/use-push-subscription"

// beforeinstallprompt não é um evento padrão do DOM (só Chrome/Edge/Android).
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

const INSTALL_DISMISSED_KEY = "welcome-install-dismissed"
const NOTIFY_DISMISSED_KEY = "welcome-notify-dismissed"

type Step = "install" | "notify" | "battery-tip" | null

// Convite de "primeiros passos" — instalar o app e ativar notificações numa
// experiência só, em vez de duas coisas desconectadas (o antigo aviso de
// instalação nunca mencionava notificação, e o sino do cabeçalho não tinha
// nenhum destaque chamando atenção pra ele). Mostrado uma vez por etapa;
// quem já resolveu as duas não vê nada.
export default function WelcomeBanner() {
  const [step, setStep] = useState<Step>(null)
  const [isIOS, setIsIOS] = useState(false)
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null)
  const push = usePushSubscription()

  useEffect(() => {
    const installDismissed = localStorage.getItem(INSTALL_DISMISSED_KEY) === "true"
    const notifyDismissed = localStorage.getItem(NOTIFY_DISMISSED_KEY) === "true"

    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    setIsIOS(isIOSDevice)

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true

    function decideStep() {
      if (!isStandalone && !installDismissed && (isIOSDevice || deferredPromptRef.current)) {
        setStep("install")
        return
      }
      if (!notifyDismissed && push.checked && push.isSupported && !push.isSubscribed) {
        setStep("notify")
        return
      }
      setStep((current) => (current === "battery-tip" ? current : null))
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      deferredPromptRef.current = e as BeforeInstallPromptEvent
      decideStep()
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    decideStep()

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
  }, [push.checked, push.isSupported, push.isSubscribed])

  useEffect(() => {
    // A etapa "battery-tip" tem texto mais longo (2-3 linhas em telas
    // estreitas) e precisa de mais espaço reservado no <main> — ver
    // .has-install-prompt-tall em globals.css. Só uma das duas classes fica
    // ativa por vez.
    document.body.classList.toggle("has-install-prompt", step !== null && step !== "battery-tip")
    document.body.classList.toggle("has-install-prompt-tall", step === "battery-tip")
    return () => {
      document.body.classList.remove("has-install-prompt")
      document.body.classList.remove("has-install-prompt-tall")
    }
  }, [step])

  async function handleInstall() {
    if (isIOS) return // iOS não tem prompt programático — instrução já é o conteúdo mostrado
    if (!deferredPromptRef.current) return
    try {
      await deferredPromptRef.current.prompt()
      await deferredPromptRef.current.userChoice
      deferredPromptRef.current = null
    } catch (error) {
      console.error("Erro ao tentar instalar o PWA:", error)
    }
    // Segue pro próximo passo (notificação) se ainda fizer sentido — em
    // Android isso acontece na mesma sessão, sem precisar sair da página.
    if (push.checked && push.isSupported && !push.isSubscribed) {
      setStep("notify")
    } else {
      setStep(null)
    }
  }

  function closeInstall() {
    localStorage.setItem(INSTALL_DISMISSED_KEY, "true")
    if (push.checked && push.isSupported && !push.isSubscribed) {
      setStep("notify")
    } else {
      setStep(null)
    }
  }

  async function handleActivateNotifications() {
    const result = await push.activate()
    if (result === "granted") {
      setStep("battery-tip")
    } else {
      // Negou a permissão do navegador — respeitar e não insistir.
      localStorage.setItem(NOTIFY_DISMISSED_KEY, "true")
      setStep(null)
    }
  }

  function closeNotify() {
    localStorage.setItem(NOTIFY_DISMISSED_KEY, "true")
    setStep(null)
  }

  function closeBatteryTip() {
    localStorage.setItem(NOTIFY_DISMISSED_KEY, "true")
    setStep(null)
  }

  if (step === null) return null

  return (
    <div className="install-prompt bg-yellow-500 text-parish-accent-text px-4 py-3 shadow-md">
      {step === "install" && (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center min-w-0">
            {isIOS ? <Share className="mr-2 h-5 w-5 shrink-0" /> : <Download className="mr-2 h-5 w-5 shrink-0" />}
            <span className="text-sm font-medium">
              {isIOS
                ? "Toque em Compartilhar e depois em “Adicionar à Tela de Início”"
                : "Instale o app da paróquia para acesso rápido"}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!isIOS && (
              <button onClick={handleInstall} className="bg-parish-accent-text text-yellow-500 text-xs font-medium px-3 py-1.5 rounded">
                Instalar
              </button>
            )}
            <button onClick={closeInstall} className="text-parish-accent-text hover:opacity-70" aria-label="Fechar">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {step === "notify" && (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center min-w-0">
            <BellRing className="mr-2 h-5 w-5 shrink-0" />
            <span className="text-sm font-medium">Ativar avisos de missa ao vivo e notícias novas?</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleActivateNotifications}
              disabled={push.isLoading}
              className="bg-parish-accent-text text-yellow-500 text-xs font-medium px-3 py-1.5 rounded disabled:opacity-60"
            >
              Ativar
            </button>
            <button onClick={closeNotify} className="text-parish-accent-text hover:opacity-70" aria-label="Fechar">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {step === "battery-tip" && (
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm">
            <strong>Notificações ativadas!</strong> Em alguns celulares (Samsung, Xiaomi, Motorola), é preciso
            desativar a &quot;otimização de bateria&quot; do Chrome pra elas chegarem mesmo com o app fechado —
            geralmente em Configurações → Apps → Chrome → Bateria.
          </p>
          <button onClick={closeBatteryTip} className="text-parish-accent-text hover:opacity-70 shrink-0" aria-label="Fechar">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
