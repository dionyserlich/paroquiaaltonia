import type { GlobalConfig } from "payload"

export const Sobre: GlobalConfig = {
  slug: "sobre",
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
