import type { GlobalConfig } from "payload"

export const Dizimo: GlobalConfig = {
  slug: "dizimo",
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "conteudo",
      type: "richText",
    },
    {
      name: "chavePix",
      type: "text",
    },
  ],
}
