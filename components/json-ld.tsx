// Helper genérico pra injetar dado estruturado (schema.org) em qualquer
// página — sempre a partir de um objeto que o próprio servidor monta, nunca de
// texto do usuário concatenado à mão no HTML.
//
// Só que o JSON.stringify sozinho não fecha a porta: ele não escapa "<", e o
// parser de HTML do navegador não entende JSON — ele encerra o bloco no
// primeiro "</script" que aparecer dentro dele, e todo o resto passa a ser
// tratado como marcação da página. Como os valores aqui vêm do CMS (título e
// descrição de evento, telefone, e-mail, endereço), bastava alguém digitar
// essa sequência num campo de texto para o dado estruturado virar um ponto de
// injeção.
//
// Escapar "<" como \u003c resolve na origem: é escape de string JSON válido
// (quem consome lê o mesmo caractere de volta, Google incluído) e o navegador
// deixa de ver qualquer tag. E como todo dado estruturado do site passa por
// este componente, é o ponto único que cobre todos os usos de uma vez.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  )
}
