"use client"

import Link from "next/link"
import { ChevronRight, Church, MapPin, Users } from "lucide-react"

// Mesmos ícones usados em components/side-menu.tsx pros mesmos destinos —
// mesmo lugar, mesmo ícone, não importa por qual caminho a pessoa chega.
const conhecaParoquia = [
  {
    icon: <Church className="h-6 w-6" />,
    label: "Sobre a Paróquia",
    description: "Nossa história, padres e comunidade",
    href: "/sobre",
  },
  {
    icon: <Users className="h-6 w-6" />,
    label: "Pastorais",
    description: "Grupos que atuam na paróquia",
    href: "/pastorais",
  },
  {
    icon: <MapPin className="h-6 w-6" />,
    label: "Capelas e Comunidades",
    description: "Capelas na cidade e na zona rural",
    href: "/capelas",
  },
]

export default function ConhecaParoquia() {
  return (
    <div className="w-full px-4">
      <div className="flex items-center mb-4">
        <h2 className="text-white text-xl font-bold">Conheça a</h2>
        <span className="text-white ml-1 text-xl">paróquia:</span>
      </div>
      <div className="space-y-3">
        {conhecaParoquia.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className="flex items-center gap-4 bg-parish-card rounded-lg p-4 hover:bg-white/5 transition-colors"
          >
            <div className="bg-yellow-500/15 text-yellow-500 rounded-full p-3 shrink-0">{link.icon}</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold">{link.label}</h3>
              <p className="text-gray-300 text-sm truncate">{link.description}</p>
            </div>
            <ChevronRight className="text-gray-400 shrink-0" size={20} />
          </Link>
        ))}
      </div>
    </div>
  )
}
