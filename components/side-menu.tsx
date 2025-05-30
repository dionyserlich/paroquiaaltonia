"use client"

import type React from "react"

import {
  BookIcon as Bible,
  BookOpen,
  Church,
  DollarSign,
  HelpCircle,
  PenSquare,
  Share2,
  Users,
  X,
  Facebook,
  Instagram,
  Youtube,
  HandHeart,
  Heart,
  Calendar,
} from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

interface SideMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function SideMenu({ isOpen, onClose }: SideMenuProps) {
  // Fechar o menu ao pressionar ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    if (isOpen) {
      window.addEventListener("keydown", handleEsc)
    }

    return () => {
      window.removeEventListener("keydown", handleEsc)
    }
  }, [onClose, isOpen])

  // Garantir que links internos fechem o menu e restaurem o scroll
  const handleInternalLinkClick = () => {
    onClose()
  }

  return (
    <>
      {/* Overlay para fechar o menu ao clicar fora */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Menu lateral */}
      <div
        className={`fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-[#0a1e42] z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } overflow-y-auto`}
      >
        <div className="p-4 border-b border-blue-900 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Menu</h2>
          <button onClick={onClose} className="text-white p-1">
            <X size={24} />
          </button>
        </div>

        <div className="py-2">
          <MenuSection title="Espiritual">
            <MenuItem
              href="/liturgia"
              icon={<BookOpen size={20} />}
              label="Liturgia do Dia"
              onClick={handleInternalLinkClick}
            />
            <MenuItem href="https://www.bibliaonline.com.br/" icon={<Bible size={20} />} label="Bíblia" external />
          </MenuSection>

          <MenuSection title="Serviços">
            <MenuItem
              href="/eventos"
              icon={<Calendar size={20} />}
              label="Próximos Eventos"
              onClick={handleInternalLinkClick}
            />
            <MenuItem
              href="/intencoes"
              icon={<PenSquare size={20} />}
              label="Pedidos de Intenções"
              onClick={handleInternalLinkClick}
            />
            <MenuItem
              href="/ofertas"
              icon={<HandHeart size={20} />}
              label="Ofertas"
              onClick={handleInternalLinkClick}
            />
            <MenuItem href="/dizimo" icon={<Heart size={20} />} label="Dízimo" onClick={handleInternalLinkClick} />
          </MenuSection>

          <MenuSection title="Comunidade">
            <MenuItem
              href="/sobre"
              icon={<Church size={20} />}
              label="Sobre a Paróquia"
              onClick={handleInternalLinkClick}
            />
            <MenuItem
              href="/pastorais"
              icon={<Users size={20} />}
              label="Pastorais"
              onClick={handleInternalLinkClick}
            />
            <MenuItem href="/ajuda" icon={<HelpCircle size={20} />} label="Ajuda" onClick={handleInternalLinkClick} />
          </MenuSection>

          <MenuSection title="Redes Sociais">
            <MenuItem
              href="https://facebook.com/paroquiaaltonia"
              icon={<Facebook size={20} />}
              label="Facebook"
              external
            />
            <MenuItem
              href="https://instagram.com/paroquiaaltonia"
              icon={<Instagram size={20} />}
              label="Instagram"
              external
            />
            <MenuItem
              href="https://youtube.com/paroquiaaltonia"
              icon={<Youtube size={20} />}
              label="YouTube"
              external
            />
          </MenuSection>

          <div className="px-4 py-3">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: "Paróquia São Sebastião",
                    text: "Conheça o aplicativo da Paróquia São Sebastião de Altônia",
                    url: window.location.origin,
                  })
                }
                onClose()
              }}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg hover:bg-blue-900 transition-colors"
            >
              <Share2 size={20} className="text-yellow-500" />
              <span className="text-white">Compartilhar</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function MenuSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="px-4 py-2 text-sm font-semibold text-yellow-500">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function MenuItem({
  href,
  icon,
  label,
  external = false,
  onClick,
}: {
  href: string
  icon: React.ReactNode
  label: string
  external?: boolean
  onClick?: () => void
}) {
  const content = (
    <>
      <span className="text-yellow-500">{icon}</span>
      <span className="text-white">{label}</span>
    </>
  )

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-3 px-4 py-3 hover:bg-blue-900 transition-colors"
      >
        {content}
      </a>
    )
  }

  return (
    <Link
      href={href}
      className="flex items-center space-x-3 px-4 py-3 hover:bg-blue-900 transition-colors"
      onClick={onClick}
    >
      {content}
    </Link>
  )
}
