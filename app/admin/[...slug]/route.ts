import { NextResponse } from "next/server"

// Esta rota dinâmica impede que o Next.js tente pré-renderizar as páginas do admin
export async function GET() {
  return NextResponse.json({ error: "Acesso direto não permitido" }, { status: 403 })
}
