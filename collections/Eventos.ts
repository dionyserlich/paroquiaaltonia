import type { CollectionConfig } from "payload"
import { revalidarCaminhos } from "@/app/lib/revalidar"
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
        // Publicação instantânea apesar do cache (ver app/lib/revalidar.ts).
        revalidarCaminhos(["/", "/eventos", `/eventos/${doc.slug}`, "/api/eventos/proximos"])
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
      // Onde o evento acontece, quando NÃO é na matriz. Vazio significa
      // "na paróquia": é o caso da grande maioria, e deixar em branco
      // preserva o comportamento de todos os eventos já cadastrados.
      //
      // Existe porque o dado estruturado (schema.org/Event, ver
      // app/(frontend)/eventos/[slug]/page.tsx) declarava o endereço da
      // matriz em todo evento — inclusive nos que acontecem em outro lugar,
      // como as festas de comunidade na Sociedade Rural. Endereço errado no
      // JSON-LD vira endereço errado no resultado do Google.
      name: "local",
      type: "text",
      admin: {
        description: "Deixe vazio se for na matriz. Ex.: Sociedade Rural de Altônia",
      },
    },
    {
      name: "endereco",
      type: "text",
      admin: {
        description: "Endereço do local, se souber. Só usado quando há um local preenchido acima.",
        condition: (data) => Boolean(data?.local),
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
