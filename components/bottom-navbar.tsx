"use client"

import type React from "react"

import Link from "next/link"
import { Book, Calendar, MessageCircle } from "lucide-react"
import Image from "next/image"

export default function BottomNavbar() {
  return (
    <nav className="fixed bottom-0 bg-[#0a1e42] border-t border-blue-900 flex justify-between items-center px-2 py-2 z-40 w-full">
      <NavItem href="/liturgia" icon={<Book size={20} />} label="Liturgia" />
      <NavItem href="/folhetos" icon={<Book size={20} />} label="Folhetos" />

      <Link href="/" className="flex flex-col items-center justify-center -mt-6">
        <div className="bg-yellow-500 rounded-full p-2 mb-1">
          <Image
            src="/images/logo-icone.png"
            alt="Logo São Sebastião"
            width={40}
            height={40}
            className="rounded-full"
          />
        </div>
      </Link>

      <NavItem href="/horarios" icon={<Calendar size={20} />} label="Horários" />
      <NavItem href="/whats" icon={<MessageCircle size={20} />} label="WhatsApp" />
    </nav>
  )
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center text-white text-xs">
      <div className="mb-1">{icon}</div>
      <span>{label}</span>
    </Link>
  )
}
