// Tipos leves e escritos à mão para os dados vindos do Payload — o gerador
// oficial (`payload generate:types`) esbarra no mesmo bug de interop
// ESM/CJS fora do runtime do Next (ver comentário em scripts/migrate-to-payload.ts)
// e não roda localmente nesta versão de Node. Cobre só os campos usados
// pelo front público; não é o tipo completo de cada collection.

export type MediaDoc = {
  id: number
  url?: string | null
  alt?: string | null
  width?: number | null
  height?: number | null
}

export type Noticia = {
  id: number
  legacyId?: number | null
  slug?: string | null
  titulo: string
  resumo?: string | null
  conteudo?: unknown
  imagem?: MediaDoc | number | null
  galeria?: { imagem: MediaDoc | number }[] | null
  data: string
}

export type Evento = {
  id: number
  legacyId?: number | null
  slug?: string | null
  titulo: string
  startAt: string
  endAt?: string | null
  descricao?: string | null
  conteudo?: unknown
}
