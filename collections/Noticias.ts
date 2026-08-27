import type { CollectionConfig } from "payload"

export const Noticias: CollectionConfig = {
  slug: "noticias",
  admin: {
    useAsTitle: "titulo",
    defaultColumns: ["titulo", "data", "_status"],
  },
  access: {
    read: () => true,
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: "titulo",
      type: "text",
      required: true,
    },
    {
      name: "resumo",
      type: "textarea",
    },
    {
      name: "conteudo",
      type: "richText",
    },
    {
      name: "imagem",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "data",
      type: "date",
      required: true,
      defaultValue: () => new Date().toISOString(),
    },
  ],
}
