"use client"

import Link from "next/link"
import { Book, BookOpen } from "lucide-react"

export default function QuickLinks() {
  // Ícone personalizado para "Intenção" (mãos em oração)
  const PrayingHandsIcon = (props: any) => (
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

  // Ícone personalizado para "Ofertas" (moeda/doação)
  const DonationIcon = (props: any) => (
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
      <circle cx="12" cy="12" r="8" />
      <path d="M14.5 9.5 12 12m0 0-2.5 2.5M12 12l2.5 2.5M12 12 9.5 9.5" />
    </svg>
  )

  // Ícone personalizado para "Dízimo" (coração)
  const HeartIcon = (props: any) => (
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

  const links = [
    { icon: <Book className="h-7 w-7" />, label: "Liturgia", href: "/liturgia" },
    { icon: <BookOpen className="h-7 w-7" />, label: "Folhetos", href: "/folhetos" },
    { icon: <PrayingHandsIcon className="h-7 w-7" />, label: "Intenção", href: "/intencao" },
    { icon: <DonationIcon className="h-7 w-7" />, label: "Ofertas", href: "/ofertas" },
    { icon: <HeartIcon className="h-7 w-7" />, label: "Dízimo", href: "/dizimo" },
  ]

  return (
    <div className="w-full ">
      <div className="flex justify-between min-w-full px-4 overflow-x-auto scrollbar-hide max-w-0">
        {links.map((link, index) => (
          <Link key={index} href={link.href} className="flex flex-col items-center justify-center px-4">
            <div className="mb-2 text-white">{link.icon}</div>
            <span className="text-sm font-medium text-white whitespace-nowrap">{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
