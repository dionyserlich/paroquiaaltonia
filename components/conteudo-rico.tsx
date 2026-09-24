import { RichText, type JSXConvertersFunction } from "@payloadcms/richtext-lexical/react"

// Ponto único de renderização do conteúdo vindo do CMS (notícias, eventos,
// dízimo). Antes cada página chamava o RichText direto e embrulhava num
// `prose prose-invert` — classes do @tailwindcss/typography, que nunca
// esteve instalado aqui. Ou seja: o conteúdo saía sem formatação nenhuma em
// todo o site. O estilo real vive em .conteudo-rico (globals.css).
//
// O cast existe porque o tipo de retorno do RichText (ReactNode) não bate
// com o que a versão do @types/react instalada aceita como componente JSX.
// Ficava repetido em cada página; agora é só aqui.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComponenteCompat = (props: { data: unknown; converters?: unknown; className?: string }) => any

const RichTextCompat = RichText as unknown as ComponenteCompat

type DocDeUpload = {
  url?: string | null
  mimeType?: string | null
  alt?: string | null
  filename?: string | null
}

// O conversor padrão de `upload` só sabe desenhar imagem: para qualquer
// outro tipo ele devolve um link com o nome do arquivo. Vídeo enviado pelo
// CMS aparecia como "reel.mp4" azul no meio do texto, em vez de tocar.
const conversores: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  upload: (args) => {
    const doc = args.node.value as DocDeUpload | number | string | null | undefined

    if (doc && typeof doc === "object" && doc.url && (doc.mimeType ?? "").startsWith("video")) {
      return (
        <video controls playsInline preload="metadata" src={doc.url}>
          {doc.alt ?? doc.filename ?? "Vídeo"}
        </video>
      )
    }

    const padrao = defaultConverters.upload
    return typeof padrao === "function" ? padrao(args) : null
  },
})

export default function ConteudoRico({ data, className }: { data: unknown; className?: string }) {
  if (!data) return null
  return (
    <div className={className ? `conteudo-rico ${className}` : "conteudo-rico"}>
      <RichTextCompat data={data} converters={conversores} />
    </div>
  )
}
