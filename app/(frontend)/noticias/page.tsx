import Image from "next/image"
import Link from "next/link"
import Header from "@/components/header"
import BottomNavbar from "@/components/bottom-navbar"
import PageClient from "../page-client"
import { payloadClient } from "@/app/lib/payload"
import { formatarData } from "@/lib/utils"
import type { Noticia } from "@/app/lib/content-types"

export const metadata = {
  title: "Notícias - Paróquia São Sebastião",
  description: "Confira as últimas notícias e novidades da Paróquia São Sebastião de Altônia",
  openGraph: {
    title: "Notícias - Paróquia São Sebastião",
    description: "Confira as últimas notícias e novidades da Paróquia São Sebastião de Altônia",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Notícias - Paróquia São Sebastião",
    description: "Confira as últimas notícias e novidades da Paróquia São Sebastião de Altônia",
  },
}

// Sem isso, Next trata esta página como estática (nenhuma API dinâmica é
// chamada aqui) e congela o resultado do payload.find no build — conteúdo
// publicado depois via CMS nunca aparece até o próximo deploy.
export const dynamic = "force-dynamic"

export default async function NoticiasPage() {
  const payload = await payloadClient()
  const { docs: noticias } = await payload.find({
    collection: "noticias",
    sort: "-data",
    depth: 1,
    limit: 50,
  })

  return (
    <PageClient>
      <main className="flex min-h-screen flex-col bg-[#00143d]">
        <Header />
        <h1 className="text-2xl font-bold text-white mb-6 text-center mt-10">Notícias</h1>
        <div className="z-20 page-no-hero">
          <div className="container mx-auto px-4 py-6">
            {noticias.length === 0 ? (
              <div className="bg-gray-100 p-6 rounded-lg text-center">
                <p className="text-gray-600">Nenhuma notícia disponível no momento.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {(noticias as Noticia[]).map((noticia) => {
                  const imagem = typeof noticia.imagem === "object" ? noticia.imagem : null
                  return (
                    <Link
                      href={`/noticias/${noticia.slug}`}
                      key={noticia.id}
                      className="block bg-[#0c2657] rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="md:flex">
                        <div className="md:w-1/3 relative">
                          <div className="aspect-w-16 aspect-h-9 md:h-full">
                            <Image
                              src={imagem?.url || "/placeholder.svg?height=200&width=300"}
                              alt={imagem?.alt || noticia.titulo}
                              width={300}
                              height={200}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        </div>
                        <div className="p-4 md:w-2/3">
                          <h2 className="text-xl font-semibold mb-2">{noticia.titulo}</h2>
                          <p className="text-sm text-yellow-500 mb-2">{formatarData(noticia.data)}</p>
                          <p className="text-gray-300 line-clamp-3">
                            {noticia.resumo || "Clique para ler mais sobre esta notícia."}
                          </p>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
        <BottomNavbar />
      </main>
    </PageClient>
  )
}
