import Link from "next/link"
import { Calendar, Book, MessageCircle, Heart } from "lucide-react"

export default function QuickLinks() {
  const links = [
    { icon: <Calendar className="h-6 w-6" />, label: "Horários de Missa", href: "/horarios" },
    { icon: <Book className="h-6 w-6" />, label: "Liturgia Diária", href: "/liturgia" },
    { icon: <MessageCircle className="h-6 w-6" />, label: "Fale Conosco", href: "/contato" },
    { icon: <Heart className="h-6 w-6" />, label: "Dízimo", href: "/dizimo" },
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {links.map((link, index) => (
        <Link key={index} href={link.href} className="flex items-center p-3 bg-[#0c2657] rounded-lg text-white">
          <div className="mr-3 text-yellow-500">{link.icon}</div>
          <span className="text-sm font-medium">{link.label}</span>
        </Link>
      ))}
    </div>
  )
}
