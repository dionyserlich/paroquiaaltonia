// Migração única do banco antigo (OLD_DATABASE_URL, SQL cru) para as
// collections/globals do Payload (DATABASE_URL). Roda via rota temporária
// (ver app/api/_migrate/route.ts) em vez de `tsx` direto, porque a Local API
// do Payload, quando carregada fora do runtime do Next, esbarra num bug de
// interop ESM/CJS em payload/dist/bin/loadEnv.js (@next/env) — reproduzido
// em Node 22 e 26. Rodando dentro do `next dev` (webpack) isso não acontece.
import { Pool } from "pg"
import type { Payload } from "payload"
import fs from "fs"
import path from "path"

const MESES: Record<string, string> = {
  Janeiro: "01",
  Fevereiro: "02",
  Março: "03",
  Abril: "04",
  Maio: "05",
  Junho: "06",
  Julho: "07",
  Agosto: "08",
  Setembro: "09",
  Outubro: "10",
  Novembro: "11",
  Dezembro: "12",
}

type MigrationLog = {
  step: string
  ok: number
  failed: number
  errors: string[]
}

function oldPool() {
  const connectionString = process.env.OLD_DATABASE_URL
  if (!connectionString) throw new Error("OLD_DATABASE_URL não configurada")
  return new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 3 })
}

// Converte o HTML simples gerado pelo Tiptap (StarterKit + Link) para o JSON
// do Lexical. Cobre exatamente o que o editor antigo emite: <p>, <strong>,
// <a href>, <br> — não é um parser HTML genérico.
function htmlToLexical(html: string) {
  const paragraphs = html.match(/<p>([\s\S]*?)<\/p>/g) || []

  function parseInline(inner: string) {
    const nodes: any[] = []
    // Divide preservando as tags de interesse como tokens separados.
    const tokens = inner.split(/(<strong>|<\/strong>|<br\s*\/?>|<a\s+[^>]*href="[^"]*"[^>]*>|<\/a>)/g).filter((t) => t.length)
    let bold = false
    let linkHref: string | null = null
    let linkChildren: any[] = []

    function pushText(text: string) {
      const decoded = text
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
      if (!decoded) return
      const textNode = {
        type: "text",
        text: decoded,
        format: bold ? 1 : 0,
        detail: 0,
        mode: "normal",
        style: "",
        version: 1,
      }
      if (linkHref) linkChildren.push(textNode)
      else nodes.push(textNode)
    }

    for (const token of tokens) {
      if (token === "<strong>") bold = true
      else if (token === "</strong>") bold = false
      else if (/^<br/.test(token)) {
        if (linkHref) linkChildren.push({ type: "linebreak", version: 1 })
        else nodes.push({ type: "linebreak", version: 1 })
      } else if (/^<a\s/.test(token)) {
        const hrefMatch = token.match(/href="([^"]*)"/)
        linkHref = hrefMatch ? hrefMatch[1] : ""
        linkChildren = []
      } else if (token === "</a>") {
        if (linkHref !== null) {
          nodes.push({
            type: "link",
            children: linkChildren,
            direction: "ltr",
            format: "",
            indent: 0,
            version: 1,
            fields: { url: linkHref, newTab: true, linkType: "custom" },
          })
        }
        linkHref = null
      } else {
        pushText(token)
      }
    }
    return nodes
  }

  const children = paragraphs.map((p) => {
    const inner = p.replace(/^<p>/, "").replace(/<\/p>$/, "")
    return {
      type: "paragraph",
      children: parseInline(inner),
      direction: "ltr",
      format: "",
      indent: 0,
      version: 1,
    }
  })

  return {
    root: {
      type: "root",
      children: children.length ? children : [{ type: "paragraph", children: [], direction: "ltr", format: "", indent: 0, version: 1 }],
      direction: "ltr",
      format: "",
      indent: 0,
      version: 1,
    },
  }
}

// Faz upload de public/images/<nome> para a collection `media`, reaproveitando
// o mesmo Media doc se o mesmo arquivo já foi enviado (ex: mesma imagem usada
// em uma notícia e em um banner).
const mediaCache = new Map<string, number>()
async function uploadLocalImage(payload: Payload, imagePath: string | null, alt: string): Promise<number | null> {
  if (!imagePath) return null
  if (mediaCache.has(imagePath)) return mediaCache.get(imagePath)!

  const filePath = path.join(process.cwd(), "public", imagePath.replace(/^\//, ""))
  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo de imagem não encontrado: ${filePath}`)
  }
  const buffer = fs.readFileSync(filePath)
  const filename = path.basename(filePath)
  const ext = path.extname(filename).toLowerCase()
  const mimetype = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg"

  const doc = await payload.create({
    collection: "media",
    data: { alt },
    file: {
      data: buffer,
      mimetype,
      name: filename,
      size: buffer.length,
    },
  })
  mediaCache.set(imagePath, doc.id as number)
  return doc.id as number
}

export async function runMigration(payload: Payload) {
  const old = oldPool()
  const results: MigrationLog[] = []

  // --- banners ---
  {
    const log: MigrationLog = { step: "banners", ok: 0, failed: 0, errors: [] }
    const { rows } = await old.query("SELECT id, titulo, imagem, link, ordem FROM banners ORDER BY id")
    for (const r of rows) {
      try {
        const imagemId = await uploadLocalImage(payload, r.imagem, r.titulo)
        await payload.create({
          collection: "banners",
          data: { legacyId: r.id, titulo: r.titulo, imagem: imagemId, link: r.link, ordem: r.ordem },
        })
        log.ok++
      } catch (e: any) {
        log.failed++
        log.errors.push(`banner ${r.id}: ${e.message}`)
      }
    }
    results.push(log)
  }

  // --- noticias ---
  {
    const log: MigrationLog = { step: "noticias", ok: 0, failed: 0, errors: [] }
    const { rows } = await old.query("SELECT id, titulo, resumo, conteudo, imagem, data FROM noticias ORDER BY id")
    for (const r of rows) {
      try {
        const imagemId = await uploadLocalImage(payload, r.imagem, r.titulo)
        await payload.create({
          collection: "noticias",
          data: {
            legacyId: r.id,
            titulo: r.titulo,
            resumo: r.resumo,
            conteudo: htmlToLexical(r.conteudo || ""),
            imagem: imagemId,
            data: r.data,
            _status: "published",
          },
        })
        log.ok++
      } catch (e: any) {
        log.failed++
        log.errors.push(`noticia ${r.id}: ${e.message}`)
      }
    }
    results.push(log)
  }

  // --- eventos ---
  {
    const log: MigrationLog = { step: "eventos", ok: 0, failed: 0, errors: [] }
    const { rows } = await old.query("SELECT id, titulo, dia, mes, ano, hora, descricao, conteudo FROM eventos ORDER BY id")
    for (const r of rows) {
      try {
        const mesNumero = /^\d+$/.test(r.mes) ? r.mes.padStart(2, "0") : MESES[r.mes]
        if (!mesNumero) throw new Error(`mês não reconhecido: "${r.mes}"`)
        const hora = String(r.hora).replace(/[^\d:]/g, "")
        const dia = String(r.dia).padStart(2, "0")
        // BRT fixo (UTC-3), igual à lógica hoje usada no admin de eventos.
        const startAt = new Date(`${r.ano}-${mesNumero}-${dia}T${hora}:00-03:00`)
        if (isNaN(startAt.getTime())) throw new Error(`data inválida: ${r.ano}-${mesNumero}-${dia}T${hora}`)

        await payload.create({
          collection: "eventos",
          data: {
            legacyId: r.id,
            titulo: r.titulo,
            startAt: startAt.toISOString(),
            descricao: r.descricao,
            conteudo: r.conteudo ? htmlToLexical(r.conteudo) : undefined,
          },
        })
        log.ok++
      } catch (e: any) {
        log.failed++
        log.errors.push(`evento ${r.id}: ${e.message}`)
      }
    }
    results.push(log)
  }

  // --- missas (schema já correto, carry-over direto) ---
  {
    const log: MigrationLog = { step: "missas", ok: 0, failed: 0, errors: [] }
    const { rows } = await old.query("SELECT id, titulo, inicio, fim, link_embed, descricao FROM missas ORDER BY id")
    for (const r of rows) {
      try {
        await payload.create({
          collection: "missas",
          data: {
            legacyId: r.id,
            titulo: r.titulo,
            inicio: r.inicio,
            fim: r.fim,
            linkEmbed: r.link_embed,
            descricao: r.descricao,
          },
        })
        log.ok++
      } catch (e: any) {
        log.failed++
        log.errors.push(`missa ${r.id}: ${e.message}`)
      }
    }
    results.push(log)
  }

  // --- intencoes (continuidade de registro paroquial) ---
  {
    const log: MigrationLog = { step: "intencoes", ok: 0, failed: 0, errors: [] }
    const { rows } = await old.query(
      "SELECT id, nome, email, telefone, tipo, intencao, data_preferida, status, created_at FROM intencoes ORDER BY id",
    )
    for (const r of rows) {
      try {
        await payload.create({
          collection: "intencoes",
          data: {
            legacyId: r.id,
            nome: r.nome,
            email: r.email || undefined,
            telefone: r.telefone,
            tipo: r.tipo,
            intencao: r.intencao,
            dataPreferida: r.data_preferida,
            status: r.status,
            createdAt: r.created_at,
          },
        })
        log.ok++
      } catch (e: any) {
        log.failed++
        log.errors.push(`intencao ${r.id}: ${e.message}`)
      }
    }
    results.push(log)
  }

  await old.end()

  return results
}
