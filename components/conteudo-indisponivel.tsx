import Link from "next/link"
import Header from "@/components/header"
import BottomNavbar from "@/components/bottom-navbar"

// Mostrado quando o banco não responde. Existe para o visitante não cair na
// tela genérica de "Algo deu errado", que não explica nada e ainda some com
// a navegação — foi exatamente o que apareceu quando a cota do banco acabou.
// Aqui a pessoa entende que é temporário e continua conseguindo circular
// pelo site, já que boa parte dele não depende do banco.
export default function ConteudoIndisponivel({ titulo }: { titulo: string }) {
  return (
    <>
      <Header />
      <main className="min-h-screen flex flex-col bg-parish-bg">
        <div className="page-no-hero flex-1 flex flex-col items-center justify-center px-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-3">{titulo}</h1>
          <p className="text-gray-300 mb-2">Não foi possível carregar este conteúdo agora.</p>
          <p className="text-gray-400 text-sm mb-8">
            Estamos com uma instabilidade temporária. Tente de novo em alguns minutos.
          </p>
          <Link
            href="/"
            className="bg-yellow-500 text-parish-navy font-semibold px-6 py-3 rounded-full"
          >
            Voltar para o início
          </Link>
        </div>
      </main>
      <BottomNavbar />
    </>
  )
}
