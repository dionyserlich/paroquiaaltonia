"use client"

import { useState, useEffect } from "react"
import { Bell, BellOff } from "lucide-react"
import { subscribe, unsubscribe } from "@/app/actions"

export default function NotificationButton() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Verificar se o navegador suporta notificações
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true)

      // Verificar se já está inscrito
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
        // Cancelar inscrição
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()

        if (subscription) {
          await subscription.unsubscribe()
          await unsubscribe(subscription.endpoint)
          setIsSubscribed(false)
        }
      } else {
        // Solicitar permissão
        const permission = await Notification.requestPermission()

        if (permission === "granted") {
          // Inscrever
          const registration = await navigator.serviceWorker.ready
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
          })

          await subscribe(subscription)
          setIsSubscribed(true)
        }
      }
    } catch (error) {
      console.error("Erro ao gerenciar notificações:", error)
    } finally {
      setIsLoading(false)
    }
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
