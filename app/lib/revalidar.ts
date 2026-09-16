import { revalidatePath } from "next/cache"

// As páginas e rotas de conteúdo deixaram de ser force-dynamic e passaram a
// ter cache por tempo (ver os `export const revalidate` espalhados). Isso
// existe por uma razão concreta: no plano gratuito da Neon o banco só pode
// ficar ligado ~400 das 730 horas do mês, e cada visita sem cache o acordava
// por mais 5 minutos. Com cache, uma rajada de visitantes custa uma consulta
// em vez de uma por pessoa.
//
// O efeito colateral seria a edição no CMS demorar até o cache expirar. Esta
// função elimina isso: ao salvar, os caminhos afetados são invalidados na
// hora, então continua publicando instantaneamente — só que sem pagar uma
// consulta por visita no resto do tempo.
export function revalidarCaminhos(caminhos: string[]) {
  for (const caminho of caminhos) {
    try {
      revalidatePath(caminho)
    } catch (err) {
      // Nunca deixar a revalidação derrubar a gravação em si: o conteúdo
      // salvo é mais importante que o cache atualizado, e o tempo de
      // expiração serve de rede de segurança.
      console.error("[revalidar] falha em", caminho, err)
    }
  }
}
