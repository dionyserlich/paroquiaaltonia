import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword) {
      console.error("ADMIN_PASSWORD não configurada")
      return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
    }

    const { password } = await request.json()

    if (password === adminPassword) {
      // Senha correta, definir cookie de autenticação
      const cookieStore = await cookies()

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
