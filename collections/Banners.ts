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
