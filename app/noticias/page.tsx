import NoticiasLista from "./noticias-lista"

export const metadata = {
  title: "Notícias - Paróquia São Sebastião",
  description: "Últimas notícias e comunicados da Paróquia São Sebastião",
}

export default function NoticiasPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Notícias</h1>
      <NoticiasLista />
    </main>
  )
}
