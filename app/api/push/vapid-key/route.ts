import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

// A chave VAPID pública já vai pro cliente no bundle (NEXT_PUBLIC_*) — não
// é segredo. Esta rota existe só porque o service worker é um arquivo
// estático em public/, sem acesso ao env do build: quando ele precisa
// refazer a inscrição sozinho (pushsubscriptionchange) e o navegador não
// informa a chave anterior, ele busca aqui. Mantém uma fonte única de
// verdade em vez de repetir a chave dentro do sw.js.
export async function GET() {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (!key) {
    return NextResponse.json({ error: "VAPID key não configurada" }, { status: 500 })
  }
  return NextResponse.json({ key })
}
