import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PUBLIC_ADMIN_API = ["/api/admin/login", "/api/admin/logout"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthed = request.cookies.get("admin_auth")?.value === "true"

  // Páginas /admin (exceto /admin/login): redireciona para o login se não autenticado.
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!isAuthed) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
    return NextResponse.next()
  }

  // Rotas de API /api/admin/*: defesa em profundidade além do check em cada handler.
  // Login/logout precisam ficar acessíveis sem sessão.
  if (pathname.startsWith("/api/admin") && !PUBLIC_ADMIN_API.includes(pathname)) {
    if (!isAuthed) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}
