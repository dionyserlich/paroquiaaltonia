"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import NotificationsPanel from "@/components/notifications-panel"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    // Verificar o estado inicial
    if (window.scrollY > 10) {
      setIsScrolled(true)
    } else {
      setIsScrolled(false)
    }

    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 z-50 flex items-center justify-between px-4 py-3 transition-all duration-300 w-full ${
        isScrolled ? "bg-parish-navy" : "bg-transparent"
      }`}
    >
      <Link href="/" className="flex items-center">
        <Image src="/images/logo-icone.png" alt="Paróquia São Sebastião" width={40} height={40} />
        <div className="ml-2 text-yellow-500 font-medium text-sm">
          <div>Paróquia</div>
          <div>São Sebastião</div>
        </div>
      </Link>

      <NotificationsPanel />
    </header>
  )
}
