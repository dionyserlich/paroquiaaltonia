"use client"

import { useState, useEffect } from "react"
import { Bell, BellOff } from "lucide-react"
import { subscribe, unsubscribe } from "@/app/actions"

// Conversão explícita pra Uint8Array em vez de passar a VAPID key como string
// direto pro pushManager.subscribe — suporte a string é inconsistente entre
// navegadores, Uint8Array é o formato aceito por todos.
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function NotificationButton() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  // Push web no iOS só é entregue a uma PWA instalada na tela de início —
  // Safari não entrega push pra aba comum do navegador.
  const [iosNeedsInstall, setIosNeedsInstall] = useState(false)

  useEffect(() => {
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true

    if (isIOSDevice && !isStandalone) {
      setIosNeedsInstall(true)
      return
    }

    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true)
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setIsSubscribed(!!subscription)
        })
      })
    }
  }, [])

  async function handleToggleNotifications() {
    if (!isSupported) return

    setIsLoading(true)

    try {
      if (isSubscribed) {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()

        if (subscription) {
          await subscription.unsubscribe()
          await unsubscribe(subscription.endpoint)
          setIsSubscribed(false)
        }
      } else {
        const permission = await Notification.requestPermission()

        if (permission === "granted") {
          const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
          if (!vapidKey) throw new Error("NEXT_PUBLIC_VAPID_PUBLIC_KEY não configurada")

          const registration = await navigator.serviceWorker.ready
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey),
          })

          const json = subscription.toJSON()
          if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
            throw new Error("Inscrição de push incompleta")
          }
          await subscribe({
            endpoint: json.endpoint,
            keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
          })
          setIsSubscribed(true)
        }
      }
    } catch (error) {
      console.error("Erro ao gerenciar notificações:", error)
    } finally {
      setIsLoading(false)
    }
  }

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
      onClick={handleToggleNotifications}
      disabled={isLoading}
      className="text-white p-2"
      aria-label={isSubscribed ? "Desativar notificações" : "Ativar notificações"}
    >
      {isSubscribed ? <Bell size={24} /> : <BellOff size={24} />}
    </button>
  )
}
