import type { CollectionConfig } from "payload"

export const Missas: CollectionConfig = {
  slug: "missas",
  admin: {
    useAsTitle: "titulo",
    defaultColumns: ["titulo", "inicio", "fim"],
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
      name: "inicio",
      type: "date",
      required: true,
      admin: {
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
    },
    {
      name: "fim",
      type: "date",
      required: true,
      admin: {
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
    },
    {
      // Lido pelo fallback de components/live-mass-button.tsx — manter o nome do campo.
      name: "linkEmbed",
      type: "text",
    },
    {
      name: "descricao",
      type: "textarea",
    },
  ],
}
