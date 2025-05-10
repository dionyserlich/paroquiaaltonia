import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// Senha simples para acesso administrativo
// Em produção, use variáveis de ambiente para armazenar a senha
const ADMIN_PASSWORD = "paroquia2024"

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (password === ADMIN_PASSWORD) {
      // Senha correta, definir cookie de autenticação
      const cookieStore = cookies()

      // Definir um cookie que expira em 24 horas
      cookieStore.set("admin_auth", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 24 horas
        path: "/",
      })

      return NextResponse.json({ success: true })
    } else {
      // Senha incorreta
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 })
    }
  } catch (error) {
    console.error("Erro no login:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
