import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Verificar se a rota começa com /admin (exceto /admin/login)
  if (request.nextUrl.pathname.startsWith("/admin") && !request.nextUrl.pathname.startsWith("/admin/login")) {
    // Verificar se o cookie de autenticação existe
    const adminAuth = request.cookies.get("admin_auth")

    if (!adminAuth || adminAuth.value !== "true") {
      // Redirecionar para a página de login se não estiver autenticado
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
