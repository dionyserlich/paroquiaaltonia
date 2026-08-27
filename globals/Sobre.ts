import type { GlobalConfig } from "payload"

export const Sobre: GlobalConfig = {
  slug: "sobre",
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "introducao",
      type: "textarea",
      admin: { description: "Parágrafo de abertura, logo abaixo do título." },
    },
    {
      // Ícone e cor de cada item ficam fixos no template (por posição) —
      // só o texto é editável, conforme decisão do time.
      name: "timeline",
      type: "array",
      labels: { singular: "Período histórico", plural: "Períodos históricos" },
      fields: [
        { name: "titulo", type: "text", required: true },
        { name: "badge", type: "text", required: true },
        { name: "texto", type: "textarea", required: true },
      ],
    },
    {
      name: "legado",
      type: "textarea",
      admin: { description: "Parágrafo final, seção 'Um legado que continua'." },
    },
  ],
}
