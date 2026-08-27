import { notFound, redirect } from "next/navigation"
import type { CollectionSlug, Payload } from "payload"

// Busca um documento pelo slug (URL amigável) e, se não achar, tenta o
// legacyId (id numérico do banco antigo) — se achar por aí, redireciona pra
// URL nova com slug em vez de servir o conteúdo na URL antiga. Preserva
// links já compartilhados como /noticias/6 sem manter ids como identificador
// primário de URL (ver Fase 3 do plano).
export async function findBySlugOrLegacyId<T extends { slug?: string | null }>(
  payload: Payload,
  collection: CollectionSlug,
  param: string,
  basePath: string,
): Promise<T> {
  const bySlug = await payload.find({
    collection,
    where: { slug: { equals: param } },
    limit: 1,
    depth: 2,
  })
  const foundBySlug = bySlug.docs[0] as unknown as T | undefined
  if (foundBySlug) return foundBySlug

  const legacyId = Number(param)
  if (Number.isFinite(legacyId) && param.trim() !== "") {
    const byLegacy = await payload.find({
      collection,
      where: { legacyId: { equals: legacyId } },
      limit: 1,
    })
    const foundByLegacy = byLegacy.docs[0] as unknown as (T & { slug?: string | null }) | undefined
    if (foundByLegacy?.slug) redirect(`${basePath}/${foundByLegacy.slug}`)
  }

  notFound()
}
