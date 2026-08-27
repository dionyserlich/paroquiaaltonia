import DOMPurify from "dompurify"

// Allowlist alinhada ao que o editor Tiptap (StarterKit + Image + Link) gera.
// Usado para sanitizar HTML vindo do admin antes de dangerouslySetInnerHTML.
// Só deve ser chamado no client (depende de `window`/`document`) — os dois
// usos atuais (noticia-detalhes.tsx, evento-detalhes.tsx) só chamam isso
// depois de um fetch em useEffect, nunca durante o SSR.
const RICH_TEXT_TAGS = [
  "p", "br", "strong", "b", "em", "i", "s", "strike", "u",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "blockquote", "code", "pre", "a", "img", "hr",
]
const RICH_TEXT_ATTR = ["href", "target", "rel", "src", "alt", "title"]

export function sanitizeRichText(html: string | null | undefined) {
  if (!html) return ""
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: RICH_TEXT_TAGS, ALLOWED_ATTR: RICH_TEXT_ATTR })
}
