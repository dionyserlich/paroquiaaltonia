import { unstable_cache } from "next/cache"

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
export function consultaCacheada<T>(
  chave: string,
  tag: string,
  segundos: number,
  consulta: () => Promise<T>
): () => Promise<T> {
  return unstable_cache(consulta, [chave], { revalidate: segundos, tags: [tag] })
}
