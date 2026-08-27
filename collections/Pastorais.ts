import type { CollectionConfig } from "payload"

export const Pastorais: CollectionConfig = {
  slug: "pastorais",
  admin: {
    useAsTitle: "nome",
    defaultColumns: ["nome", "ordem"],
  },
  defaultSort: "ordem",
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "nome",
      type: "text",
      required: true,
    },
    {
      name: "descricao",
      type: "textarea",
      required: true,
    },
    {
      name: "atividades",
      type: "array",
      fields: [
        {
          name: "atividade",
          type: "text",
          required: true,
        },
      ],
    },
    {
      // Mapeado em código (não texto livre) para não quebrar o layout com um valor inválido.
      name: "icone",
      type: "select",
      required: true,
      defaultValue: "church",
      options: [
        { label: "Comunicação (balão de fala)", value: "message-circle" },
        { label: "Família (coração)", value: "heart" },
        { label: "Sobriedade (escudo)", value: "shield" },
        { label: "Comunidade (pessoas)", value: "users" },
        { label: "Igreja", value: "church" },
      ],
    },
    {
      name: "tema",
      type: "select",
      required: true,
      defaultValue: "blue",
      options: [
        { label: "Azul", value: "blue" },
        { label: "Rosa", value: "pink" },
        { label: "Verde", value: "green" },
        { label: "Amarelo", value: "yellow" },
        { label: "Roxo", value: "purple" },
      ],
    },
    {
      name: "ordem",
      type: "number",
      defaultValue: 0,
    },
  ],
}
