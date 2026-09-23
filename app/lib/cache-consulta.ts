import { unstable_cache } from "next/cache"

// Último resultado bem-sucedido de cada consulta, guardado na memória da
// instância. É a rede de segurança para quando o banco cai: ver
// `consultaCacheada` abaixo.
//
// O Map é limitado pelas chaves fixas usadas no código (uma dúzia), então
// não cresce sem controle. Não é compartilhado entre instâncias nem
// sobrevive a um cold start — de propósito: qualquer armazenamento externo
// (Blob, Redis) traria custo e mais uma peça pra cair junto, e a maior parte
// do tráfego real é atendida por instância quente.
const ultimoBom = new Map<string, unknown>()

// Cacheia o RESULTADO de uma consulta ao banco, não a resposta HTTP.
//
// Por que assim: o plano gratuito da Neon dá ~400 das 730 horas do mês com o
// banco ligado, e ele adormece após 5 minutos parado. Sem cache, cada visita
// disparava uma consulta por rota (a home sozinha chama seis), acordando o
// banco e segurando-o por mais 5 minutos — o que consumia a cota mesmo com
// pouco tráfego.
//
// Cachear a consulta, e não a rota, é deliberado: a rota segue dinâmica,
// então nada é congelado no build (um deploy com o banco fora não publica
// conteúdo vazio) e os cabeçalhos continuam corretos. Só a ida ao Postgres é
// evitada, que é o que custa.
//
// A `tag` permite invalidar na hora em que o conteúdo muda (ver
// app/lib/revalidar.ts), então o cache não atrasa publicação.
//
// Sobre o fallback: o `unstable_cache` protege enquanto a entrada é válida,
// mas no instante em que ela expira ele refaz a consulta e propaga o erro se
// o banco estiver fora. Quem chama trata isso devolvendo lista vazia, e o
// resultado era uma home que respondia 200 sem uma notícia ou evento —
// exatamente o que o Google classifica como soft 404, além de ser uma página
// inútil para quem visita. Com o último-bom-resultado, uma queda do banco
// passa a mostrar conteúdo levemente defasado em vez de tela vazia.
export function consultaCacheada<T>(
  chave: string,
  tag: string,
  segundos: number,
  consulta: () => Promise<T>
): () => Promise<T> {
  const cacheada = unstable_cache(consulta, [chave], { revalidate: segundos, tags: [tag] })

  return async () => {
    try {
      const resultado = await cacheada()
      ultimoBom.set(chave, resultado)
      return resultado
    } catch (err) {
      if (ultimoBom.has(chave)) {
        console.error(`[cache-consulta] ${chave} falhou, servindo o último resultado bom:`, err)
        return ultimoBom.get(chave) as T
      }
      throw err
    }
  }
}
