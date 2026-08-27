import type { GlobalConfig } from "payload"

export const Ofertas: GlobalConfig = {
  slug: "ofertas",
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "conteudo",
      type: "richText",
    },
  ],
}
