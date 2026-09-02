import type { OpcoesNotificacao } from "@/app/actions"

// Prazo de entrega e prioridade por tipo de aviso, num lugar só.
//
// O que isto resolve: a biblioteca de push guarda uma mensagem não
// entregue por QUATRO SEMANAS por padrão. Quem ficasse alguns dias com o
// aparelho desligado receberia "Missa ao vivo agora!" muito depois da missa
// ter acabado. Cada aviso passa a durar só enquanto ainda faz sentido.
//
// Não fica em app/actions.ts porque um arquivo "use server" só pode
// exportar funções assíncronas.

// A missa ao vivo só interessa enquanto está acontecendo. `topico` faz o
// serviço de push substituir um aviso anterior ainda pendente em vez de
// entregar os dois; `tag` faz o mesmo na bandeja do aparelho.
export const MISSA_AO_VIVO: OpcoesNotificacao = {
  ttlSegundos: 60 * 60,
  urgencia: "high",
  topico: "missa-ao-vivo",
  tag: "missa-ao-vivo",
}

// Notícia e evento continuam relevantes por alguns dias, mas não por
// semanas. Sem tag: são conteúdos distintos e devem poder coexistir na
// bandeja, ao contrário da missa.
export const NOTICIA: OpcoesNotificacao = {
  ttlSegundos: 3 * 24 * 60 * 60,
  urgencia: "normal",
}

export const EVENTO: OpcoesNotificacao = {
  ttlSegundos: 3 * 24 * 60 * 60,
  urgencia: "normal",
}

// Aviso de cortesia, nunca urgente — urgência baixa deixa o aparelho
// entregar junto do próximo despertar em vez de acordar o rádio à toa,
// poupando bateria.
export const VELA_APAGOU: OpcoesNotificacao = {
  ttlSegundos: 24 * 60 * 60,
  urgencia: "low",
}
