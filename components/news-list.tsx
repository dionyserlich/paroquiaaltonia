import Image from "next/image"
import Link from "next/link"
import type { Noticia, MediaDoc } from "@/app/lib/content-types"

// Componente de SERVIDOR de propósito. Antes buscava no navegador, e o
// resultado era que o HTML entregue ao Googlebot não continha manchete
// nenhuma — a home inteira tinha ~800 caracteres de texto. O Search Console
// reportou o site como "rastreada, mas não indexada", que é o sintoma
// clássico de página que só ganha conteúdo depois do JavaScript rodar.
//
// Buscando aqui, os títulos das notícias existem no HTML desde o primeiro
// byte. De quebra consome menos banco: a consulta é cacheada e serve todo
// mundo, enquanto antes cada visitante disparava a sua.
function asMedia(imagem: Noticia["imagem"]): MediaDoc | null {
  return imagem && typeof imagem === "object" ? imagem : null
}

export default function NewsList({ noticias }: { noticias: Noticia[] }) {

  if (noticias.length === 0) {
    return (
      <div className="bg-parish-card p-6 rounded-lg text-center">
        <p className="text-gray-300">Nenhuma notícia disponível no momento.</p>
      </div>
    )
  }

  const noticiaDestaque = noticias[0]
  const outrasNoticias = noticias.slice(1, 3)

  return (
    <div className="space-y-4">
      {noticiaDestaque && (
        <Link href={`/noticias/${noticiaDestaque.slug}`} className="block">
          <div className="relative w-full h-48 rounded-lg overflow-hidden">
            <Image
              src={asMedia(noticiaDestaque.imagem)?.url || "/placeholder.svg?height=192&width=400"}
              alt={asMedia(noticiaDestaque.imagem)?.alt || noticiaDestaque.titulo}
              fill
              className="object-cover"
            />
          </div>
          <h3 className="text-white font-medium mt-2">{noticiaDestaque.titulo}</h3>
        </Link>
      )}

      {outrasNoticias.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {outrasNoticias.map((noticia) => (
            <Link href={`/noticias/${noticia.slug}`} key={noticia.id} className="block">
              <div className="relative w-full h-32 rounded-lg overflow-hidden">
                <Image
                  src={asMedia(noticia.imagem)?.url || "/placeholder.svg?height=128&width=200"}
                  alt={asMedia(noticia.imagem)?.alt || noticia.titulo}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-white text-sm font-medium mt-2">{noticia.titulo}</h3>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
