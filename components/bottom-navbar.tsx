"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Book, Calendar, Menu, MessageCircle, X } from "lucide-react"
import Image from "next/image"
import SideMenu from "./side-menu"

export default function BottomNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // Gerenciar overflow do body baseado no estado do menu
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    // Cleanup: sempre restaurar o overflow quando o componente for desmontado
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMenuOpen])

  // Garantir que o overflow seja restaurado quando a página mudar
  useEffect(() => {
    const handleRouteChange = () => {
      document.body.style.overflow = ""
      setIsMenuOpen(false)
    }

    // Escutar mudanças de rota
    window.addEventListener("beforeunload", handleRouteChange)

    return () => {
      window.removeEventListener("beforeunload", handleRouteChange)
      document.body.style.overflow = ""
    }
  }, [])

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <>
      <SideMenu isOpen={isMenuOpen} onClose={closeMenu} />

      <nav className="fixed bottom-0 bg-[#0a1e42] border-t border-blue-900 z-40 w-full shadow-[0_0_30px_rgba(0,23,63,0.9)]">
        <div className="flex justify-between items-center px-2 py-2 md:py-3 w-full max-w-[650px] mx-auto">
          <NavItem
            onClick={toggleMenu}
            icon={isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            label="Menu"
            className="md:text-base"
          />
          <NavItem href="/missas" icon={<Book size={20} />} label="Missas" />

          <Link href="/" className="flex flex-col items-center justify-center -mt-6">
            <div className="bg-yellow-500 rounded-full mb-1">
              <Image
                src="/images/logo-icone.png"
                alt="Logo São Sebastião"
                width={65}
                height={65}
                className="rounded-full"
              />
            </div>
          </Link>

          <NavItem href="/horarios" icon={<Calendar size={20} />} label="Horários" />
          <NavItem
            href="http://api.whatsapp.com/send/?phone=%2B5544998680244"
            icon={<MessageCircle size={20} />}
            label="WhatsApp"
          />
        </div>
      </nav>
    </>
  )
}

function NavItem({
  href,
  icon,
  label,
  onClick,
}: {
  href?: string
  icon: React.ReactNode
  label: string
  onClick?: () => void
}) {
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="md:text-base flex flex-col items-center justify-center text-white text-xs w-16"
      >
        <div className="mb-1">{icon}</div>
        <span>{label}</span>
      </button>
    )
  }

  return (
    <Link href={href || "#"} className="md:text-base flex flex-col items-center justify-center text-white text-xs w-16">
      <div className="mb-1">{icon}</div>
      <span>{label}</span>
    </Link>
  )
}
