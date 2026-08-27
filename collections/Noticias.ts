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
