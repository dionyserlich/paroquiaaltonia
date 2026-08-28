import type { CollectionConfig } from "payload"

// Só `nome` é obrigatório de propósito — os 16 nomes já são conhecidos (via
// a Diocese de Umuarama), mas endereço/horário/mapa de cada capela ainda
// serão preenchidos aos poucos direto aqui no /cms. Uma capela sem nada
// além do nome já aparece certinho em /capelas, sem parecer quebrada.
export const Capelas: CollectionConfig = {
  slug: "capelas",
  admin: {
    useAsTitle: "nome",
    defaultColumns: ["nome", "zona"],
  },
  defaultSort: "nome",
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
      name: "zona",
      type: "select",
      options: [
        { label: "Urbana", value: "urbana" },
        { label: "Rural", value: "rural" },
      ],
      admin: {
        description: "Usado só pra agrupar/filtrar a listagem — deixar em branco se ainda não souber.",
      },
    },
    {
      name: "endereco",
      type: "text",
    },
    {
      name: "mapaEmbedUrl",
      type: "text",
      admin: {
        description:
          "No Google Maps: ache a capela → Compartilhar → Incorporar um mapa → Copiar HTML. Pode colar o " +
          "<iframe> inteiro ou só o link — os dois funcionam.",
      },
    },
    {
      name: "horarios",
      type: "array",
      labels: { singular: "Horário de missa", plural: "Horários de missa" },
      fields: [
        { name: "diaSemana", type: "text", required: true, admin: { description: "Ex: Todo 2º domingo do mês" } },
        { name: "horario", type: "text", required: true, admin: { description: "Ex: 19h00" } },
        { name: "observacao", type: "text" },
      ],
    },
    {
      name: "foto",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "observacao",
      type: "textarea",
    },
  ],
}
