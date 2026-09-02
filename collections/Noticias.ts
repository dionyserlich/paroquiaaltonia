import type { CollectionConfig } from "payload"
import { slugify } from "@/lib/slugify"

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
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, operation }) => {
        // Notifica só na transição pra publicado (não a cada autosave de
        // rascunho) — cobre tanto "criar já publicado" quanto "publicar um
        // rascunho existente".
        const isNewPublish =
          doc._status === "published" &&
          (operation === "create" || previousDoc?._status !== "published")
        if (!isNewPublish) return doc
        try {
          const { sendNotificationToAll } = await import("@/app/actions")
          const { NOTICIA } = await import("@/app/lib/notification-options")
          await sendNotificationToAll("Nova notícia da Paróquia", doc.titulo, `/noticias/${doc.slug}`, NOTICIA)
        } catch (err) {
          console.error("[noticias] falha ao enviar notificação push:", err)
        }
        return doc
      },
    ],
  },
  fields: [
    // Guarda o id numérico do registro no banco antigo (só preenchido pela
    // migração) para permitir redirecionar links já compartilhados como
    // /noticias/6 para o novo id — sem interferir no auto-incremento normal
    // do Payload para registros criados dali em diante.
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
      // URL amigável para SEO (/noticias/[slug]) — gerado a partir do título
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
      admin: {
        description: "Imagem de capa da notícia.",
      },
    },
    {
      // Galeria de fotos própria, além da capa e de imagens soltas dentro
      // do corpo do texto (o editor rich text já suporta upload inline).
      name: "galeria",
      type: "array",
      labels: { singular: "Foto", plural: "Fotos" },
      fields: [
        {
          name: "imagem",
          type: "upload",
          relationTo: "media",
          required: true,
        },
      ],
    },
    {
      name: "data",
      type: "date",
      required: true,
      defaultValue: () => new Date().toISOString(),
    },
  ],
}
