import type { CollectionConfig } from "payload"

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    // Leitura pública, MENOS os documentos marcados como privados.
    //
    // Devolver um objeto em vez de booleano é proposital: o Payload trata o
    // retorno como filtro de consulta. Isso cobre os dois caminhos de uma vez
    // — a listagem REST (/payload-api/media) e a URL direta do arquivo
    // (/payload-api/media/file/...), que passa pelo mesmo access.read em
    // checkFileAccess e só entrega o arquivo se existir documento que case
    // com o nome E com o filtro.
    //
    // Fechar a collection inteira para anônimo não serviria: derrubaria todas
    // as imagens públicas do site (capas de notícia, banners, cartazes), que
    // são servidas por este mesmo endpoint.
    read: ({ req }) => (req.user ? true : { privado: { not_equals: true } }),
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
    {
      // Marcado pelas rotas de vela quando quem acendeu pediu sigilo da foto
      // (ver app/api/velas/route.ts e .../[id]/editar/route.ts).
      //
      // Existe porque a privacidade da vela era aplicada em duas camadas que
      // a foto não atravessava: a collection `velas` recusa leitura anônima e
      // /api/velas/publicas redige campo a campo, mas a imagem é um documento
      // de `media` — e esta collection era pública sem ressalva. Resultado: a
      // foto que a pessoa mandou esconder ficava listável por qualquer um.
      name: "privado",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Some da listagem pública e da URL direta. Usado nas fotos de vela marcadas como privadas.",
      },
    },
  ],
  upload: true,
}
