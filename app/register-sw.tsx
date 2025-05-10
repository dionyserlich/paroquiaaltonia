"use client"

import { useEffect } from "react"

export default function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").then(
          (registration) => {
            console.log("ServiceWorker registrado com sucesso:", registration.scope)
          },
          (error) => {
            console.error("Falha ao registrar ServiceWorker:", error)
          },
        )
      })
    }
  }, [])

  return null
}
