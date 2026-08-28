// Rota pequena e pública só pro WhatsApp do rodapé (components/bottom-navbar.tsx),
// que é client component renderizado em toda página e por isso não pode
// buscar o Global direto via payloadClient() como as páginas server-side
// (horarios-content.tsx, sobre-content.tsx) já fazem.
import { NextResponse } from "next/server"
import { payloadClient } from "@/app/lib/payload"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const payload = await payloadClient()
    const contactInfo = await payload.findGlobal({ slug: "contact-info" })
    return NextResponse.json({ whatsapp: contactInfo.whatsapp ?? null })
  } catch (error) {
    console.error("Erro ao buscar contato público:", error)
    return NextResponse.json({ whatsapp: null }, { status: 500 })
  }
}
