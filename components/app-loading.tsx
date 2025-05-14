"use client"

import Image from "next/image"
import { useState, useEffect } from "react"

export default function AppLoading() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Simular um tempo de carregamento mínimo
    const timer = setTimeout(() => {
      setVisible(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed inset-0 bg-[#00143d] flex flex-col items-center justify-center z-50">
      <div className="relative">
        <Image src="/images/logo-icone.png" alt="Logo São Sebastião" width={80} height={80} className="pulse" />
        <div className="hidden spinner-border absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full"></div>
      </div>
      <p className="text-white mt-4 text-sm">Carregando...</p>
    </div>
  )
}
