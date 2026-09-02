import type { CollectionConfig } from "payload"
import { slugify } from "@/lib/slugify"

export const Eventos: CollectionConfig = {
  slug: "eventos",
  admin: {
    useAsTitle: "titulo",
    defaultColumns: ["titulo", "startAt"],
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [
      async ({ doc, operation }) => {
        // Eventos não tem drafts — todo create já é público.
        if (operation !== "create") return doc
        try {
          const { sendNotificationToAll } = await import("@/app/actions")
          const { EVENTO } = await import("@/app/lib/notification-options")
          await sendNotificationToAll("Novo evento na Paróquia", doc.titulo, `/eventos/${doc.slug}`, EVENTO)
        } catch (err) {
          console.error("[eventos] falha ao enviar notificação push:", err)
        }
        return doc
      },
    ],
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
      // URL amigável para SEO (/eventos/[slug]) — gerado a partir do título
      // se não for informado manualmente.
      name: "slug",
      type: "text",
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => (value ? slugify(value) : data?.titulo ? slugify(data.titulo) : value),
        ],
      },
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
