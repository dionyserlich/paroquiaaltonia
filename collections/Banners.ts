import type { CollectionConfig } from "payload"
import { revalidarCaminhos } from "@/app/lib/revalidar"

export const Banners: CollectionConfig = {
  slug: "banners",
  hooks: {
    // Invalida o cache na hora em que o conteúdo muda — ver
    // app/lib/revalidar.ts para o porquê do cache existir.
    afterChange: [() => revalidarCaminhos(["/", "/api/banners"])],
    afterDelete: [() => revalidarCaminhos(["/", "/api/banners"])],
  },
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
