import Image from "next/image"

// Boundary de loading do Next.js — diferente do antigo AppLoading (que só
// aparecia depois que a página nova já tinha montado, ou seja, depois que
// boa parte da espera real já tinha passado sem nenhum feedback pro
// usuário), isto aqui é mostrado pelo Next automaticamente e na hora, assim
// que uma navegação começa, enquanto a página de destino ainda busca dados
// no servidor. Sem timer próprio: o Next troca isto pelo conteúdo real
// assim que estiver pronto, não precisa se esconder sozinho.
export default function Loading() {
  return (
    <div className="fixed inset-0 bg-parish-bg flex flex-col items-center justify-center z-50">
      <Image src="/images/logo-icone.png" alt="Logo São Sebastião" width={80} height={80} className="pulse" />
      <p className="text-white mt-4 text-sm">Carregando...</p>
    </div>
  )
}
