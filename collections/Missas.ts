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
  hooks: {
    afterChange: [
      async ({ doc, operation }) => {
        // Cobre tanto o bot criando o registro ao detectar uma live quanto a
        // secretaria cadastrando uma missa manualmente pelo /cms — mesmo
        // caminho de notificação nos dois casos, sem duplicar (o bot não
        // dispara notificação própria, só cria o registro).
        if (operation !== "create") return doc
        try {
          const { sendNotificationToAll } = await import("@/app/actions")
          await sendNotificationToAll("Missa ao vivo agora!", doc.titulo, "/")
        } catch (err) {
          console.error("[missas] falha ao enviar notificação push:", err)
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
