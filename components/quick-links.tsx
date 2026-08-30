"use client"

import Link from "next/link"
import { BookOpen, Flame, HandHeart } from "lucide-react"
import { PrayingHandsIcon, HeartIcon } from "@/components/icons"

// Mesmo ícone usado em components/side-menu.tsx pros mesmos destinos —
// mesmo lugar, mesmo ícone, não importa por qual caminho a pessoa chega.
const acoesRapidas = [
  { icon: <Flame className="h-7 w-7" />, label: "Acender Vela", href: "/velas" },
  { icon: <BookOpen className="h-7 w-7" />, label: "Liturgia", href: "/liturgia" },
  { icon: <PrayingHandsIcon className="h-7 w-7" />, label: "Intenções", href: "/intencoes" },
  { icon: <HandHeart className="h-7 w-7" />, label: "Ofertas", href: "/ofertas" },
  { icon: <HeartIcon className="h-7 w-7" />, label: "Dízimo", href: "/dizimo" },
]

export default function QuickLinks() {
  return (
    <div className="flex justify-between min-w-full px-4 overflow-x-auto scrollbar-hide max-w-0">
      {acoesRapidas.map((link, index) => (
        <Link key={index} href={link.href} className="flex flex-col items-center justify-center px-3 w-16">
          <div className="mb-2 text-white">{link.icon}</div>
          <span className="text-sm font-medium text-white text-center leading-tight">{link.label}</span>
        </Link>
      ))}
    </div>
  )
}
