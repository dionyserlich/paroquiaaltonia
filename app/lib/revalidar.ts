import { revalidatePath, revalidateTag } from "next/cache"

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

// Para o que é lido por tag (ver `consultaCacheada`) em vez de por caminho —
// caso das velas, cuja consulta é usada tanto pela listagem pública quanto
// pelo cron. `expire: 0` descarta a entrada na hora: com o perfil "max" o Next
// ainda serviria a versão velha uma vez antes de atualizar.
export function revalidarTag(tag: string) {
  try {
    revalidateTag(tag, { expire: 0 })
  } catch (err) {
    // Mesmo raciocínio de revalidarCaminhos: a gravação vale mais que o cache.
    console.error("[revalidar] falha na tag", tag, err)
  }
}
