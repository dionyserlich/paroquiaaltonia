"use client"

import type { SVGProps } from "react"
import Link from "next/link"
import { Book, Calendar, Church, HandHeart, MapPin, Users } from "lucide-react"

// Ícone personalizado para "Intenção" (mãos em oração). Fora do componente
// pra não ser recriado (e remontado) a cada render.
function PrayingHandsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 4c.5 0 1 .2 1.3.5.4.3.7.8.7 1.5 0 .8-.3 1.6-1 2.5-.7.8-1 1.7-1 2.5M12 4c-.5 0-1 .2-1.3.5-.4.3-.7.8-.7 1.5 0 .8.3 1.6 1 2.5.7.8 1 1.7 1 2.5" />
      <path d="M17 18.5a9 9 0 0 0-10 0" />
      <path d="M12 11v4" />
      <path d="M10 13h4" />
    </svg>
  )
}

// Ícone personalizado para "Dízimo" (coração).
function HeartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  )
}

// Calendar em vez de Church pra Missas — Church já é usado por "Sobre a
// Paróquia" na seção "Conheça a Paróquia" logo abaixo, mesma página, e os
// dois ícones ficariam parecidos demais um do outro pra representar coisas
// diferentes. Mesmo ícone usado em components/bottom-navbar.tsx pro mesmo
// destino (/missas), por consistência.
const acoesRapidas = [
  { icon: <Book className="h-7 w-7" />, label: "Liturgia", href: "/liturgia" },
  { icon: <Calendar className="h-7 w-7" />, label: "Missas", href: "/missas" },
  { icon: <PrayingHandsIcon className="h-7 w-7" />, label: "Intenções", href: "/intencoes" },
  { icon: <HandHeart className="h-7 w-7" />, label: "Ofertas", href: "/ofertas" },
  { icon: <HeartIcon className="h-7 w-7" />, label: "Dízimo", href: "/dizimo" },
]

// Mesmos ícones usados pra estes destinos em components/side-menu.tsx, por
// consistência — mesmo lugar, mesmo ícone, não importa por qual caminho a
// pessoa chega.
const conhecaPara = [
  { icon: <Church className="h-6 w-6" />, label: "Sobre a Paróquia", href: "/sobre" },
  { icon: <Users className="h-6 w-6" />, label: "Pastorais", href: "/pastorais" },
  { icon: <MapPin className="h-6 w-6" />, label: "Capelas e Comunidades", href: "/capelas" },
]

export default function QuickLinks() {
  return (
    <div className="w-full space-y-5">
      <div className="flex justify-between min-w-full px-4 overflow-x-auto scrollbar-hide max-w-0">
        {acoesRapidas.map((link, index) => (
          <Link key={index} href={link.href} className="flex flex-col items-center justify-center px-3">
            <div className="mb-2 text-white">{link.icon}</div>
            <span className="text-sm font-medium text-white whitespace-nowrap">{link.label}</span>
          </Link>
        ))}
      </div>

      <div className="px-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Conheça a paróquia</p>
        <div className="grid grid-cols-3 gap-3">
          {conhecaPara.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="flex flex-col items-center justify-center text-center gap-1.5 bg-parish-card rounded-lg px-2 py-3"
            >
              <div className="text-yellow-500">{link.icon}</div>
              <span className="text-xs font-medium text-white leading-tight">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
