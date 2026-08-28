"use client"

import { useCallback, useEffect, useState } from "react"
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

// Estado e lógica de inscrição de push compartilhados entre o sino do
// cabeçalho (components/notification-button.tsx) e o banner de boas-vindas
// (components/welcome-banner.tsx) — mesmo fluxo, dois pontos de entrada.
export function usePushSubscription() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [checked, setChecked] = useState(false)
  // Push web no iOS só é entregue a uma PWA instalada na tela de início —
  // Safari não entrega push pra aba comum do navegador.
  const [iosNeedsInstall, setIosNeedsInstall] = useState(false)

  useEffect(() => {
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true

    if (isIOSDevice && !isStandalone) {
      setIosNeedsInstall(true)
      setChecked(true)
      return
    }

    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true)
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setIsSubscribed(!!subscription)
          setChecked(true)
        })
      })
    } else {
      setChecked(true)
    }
  }, [])

  const activate = useCallback(async (): Promise<"granted" | "denied" | "unsupported"> => {
    if (!isSupported) return "unsupported"
    setIsLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== "granted") return "denied"

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
      return "granted"
    } catch (error) {
      console.error("Erro ao ativar notificações:", error)
      return "denied"
    } finally {
      setIsLoading(false)
    }
  }, [isSupported])

  const deactivate = useCallback(async () => {
    setIsLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
        await unsubscribe(subscription.endpoint)
        setIsSubscribed(false)
      }
    } catch (error) {
      console.error("Erro ao desativar notificações:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { isSupported, isSubscribed, isLoading, checked, iosNeedsInstall, activate, deactivate }
}
