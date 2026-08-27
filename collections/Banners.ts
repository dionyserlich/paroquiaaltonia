import type { CollectionConfig } from "payload"

export const Banners: CollectionConfig = {
  slug: "banners",
  admin: {
    useAsTitle: "titulo",
    defaultColumns: ["titulo", "ordem"],
  },
  defaultSort: "ordem",
  access: {
    read: () => true,
  },
  fields: [
    // Id do registro no banco antigo, só para redirecionar links antigos
    // (ver Noticias.ts para a explicação completa).
    {
      name: "legacyId",
      type: "number",
      unique: true,
      admin: { readOnly: true },
    },
    {
      name: "titulo",
      type: "text",
      required: true,
    },
    {
      name: "imagem",
      type: "upload",
      relationTo: "media",
      required: true,
    },
    {
      name: "link",
      type: "text",
    },
    {
      name: "ordem",
      type: "number",
      defaultValue: 0,
    },
  ],
}
