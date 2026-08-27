import type { CollectionConfig } from "payload"

export const Eventos: CollectionConfig = {
  slug: "eventos",
  admin: {
    useAsTitle: "titulo",
    defaultColumns: ["titulo", "startAt"],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "titulo",
      type: "text",
      required: true,
    },
    {
      name: "startAt",
      type: "date",
      required: true,
      admin: {
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
    },
    {
      name: "endAt",
      type: "date",
      admin: {
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
    },
    {
      name: "descricao",
      type: "textarea",
    },
    {
      name: "conteudo",
      type: "richText",
    },
  ],
}
