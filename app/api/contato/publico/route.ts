// Rota pequena e pública só pro WhatsApp do rodapé (components/bottom-navbar.tsx),
// que é client component renderizado em toda página e por isso não pode
// buscar o Global direto via payloadClient() como as páginas server-side
// (horarios-content.tsx, sobre-content.tsx) já fazem.
import { NextResponse } from "next/server"
import { consultaCacheada } from "@/app/lib/cache-consulta"
import { payloadClient } from "@/app/lib/payload"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const whatsapp = await consultaCacheada("contato-publico", "contato", 3600, async () => {
      const payload = await payloadClient()
      const contactInfo = await payload.findGlobal({ slug: "contact-info" })
      return (contactInfo.whatsapp ?? null) as string | null
    })()
    return NextResponse.json({ whatsapp })
  } catch (error) {
    console.error("Erro ao buscar contato público:", error)
    return NextResponse.json({ whatsapp: null }, { status: 500 })
  }
}
