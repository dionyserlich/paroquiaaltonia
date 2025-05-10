import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const cookieStore = cookies()

    // Remover o cookie de autenticação
    cookieStore.delete("admin_auth")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro no logout:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
