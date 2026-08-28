"use client"

import { Bell, BellOff } from "lucide-react"
import { usePushSubscription } from "@/hooks/use-push-subscription"

// Atalho secundário no cabeçalho pra quem já conhece o recurso e quer
// ligar/desligar depois — o ponto principal de descoberta é o banner de
// boas-vindas (components/welcome-banner.tsx), mostrado a novos visitantes.
export default function NotificationButton() {
  const { isSupported, isSubscribed, isLoading, iosNeedsInstall, activate, deactivate } = usePushSubscription()

  if (iosNeedsInstall) {
    return (
      <button
        type="button"
        className="text-white p-2 opacity-60"
        title="No iPhone, adicione o site à Tela de Início para receber notificações"
        aria-label="Notificações indisponíveis neste navegador — adicione à Tela de Início para ativar"
      >
        <BellOff size={24} />
      </button>
    )
  }

  if (!isSupported) {
    return null
  }

  return (
    <button
      onClick={() => (isSubscribed ? deactivate() : activate())}
      disabled={isLoading}
      className="text-white p-2"
      aria-label={isSubscribed ? "Desativar notificações" : "Ativar notificações"}
    >
      {isSubscribed ? <Bell size={24} /> : <BellOff size={24} />}
    </button>
  )
}
