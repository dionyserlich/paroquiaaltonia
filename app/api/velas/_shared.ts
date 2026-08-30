import { NextRequest } from "next/server"

// Compartilhado entre as rotas de velas (criar, editar) — evita duplicar a
// validação de foto e a leitura de IP em cada uma.

export function getClientIp(request: NextRequest) {
  // Mesmo raciocínio de app/api/intencoes/route.ts: o domínio passa pelo
  // Cloudflare, cf-connecting-ip é o header confiável pro IP real.
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  )
}

export function stripCtl(s: string) {
  return s.replace(/[\r\n\t\0]+/g, " ").trim()
}

export const FOTO_MAX_BYTES = 4 * 1024 * 1024
export const FOTO_TIPOS_VALIDOS = ["image/jpeg", "image/png", "image/webp"]

// Upload público sem login é um risco bem maior que texto (custo de
// armazenamento, imagem inadequada aparecendo pra todo mundo na hora) —
// validação de tipo/tamanho aqui é a que importa de verdade (o cliente
// também valida, só pra feedback rápido, nunca por segurança).
export function validarFoto(file: File | null): { ok: true } | { ok: false; error: string } {
  if (!file || file.size === 0) return { ok: true }
  if (!FOTO_TIPOS_VALIDOS.includes(file.type)) {
    return { ok: false, error: "Formato de imagem não suportado. Envie uma foto em JPEG, PNG ou WEBP." }
  }
  if (file.size > FOTO_MAX_BYTES) {
    return { ok: false, error: "A imagem é muito grande (máximo 4MB)." }
  }
  return { ok: true }
}

export async function fileParaPayloadFile(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer())
  return { data: buffer, mimetype: file.type, name: file.name, size: file.size }
}
