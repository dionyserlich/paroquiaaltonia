// Helper genérico pra injetar dado estruturado (schema.org) em qualquer
// página — sempre a partir de um objeto que o próprio servidor monta (nunca
// texto vindo direto do usuário sem passar por JSON.stringify), então não há
// risco de injeção via dangerouslySetInnerHTML aqui.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}
