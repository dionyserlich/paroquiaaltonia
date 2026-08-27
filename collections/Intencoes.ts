import type { CollectionConfig } from "payload"

export const Intencoes: CollectionConfig = {
  slug: "intencoes",
  admin: {
    useAsTitle: "nome",
    defaultColumns: ["nome", "tipo", "status", "createdAt"],
  },
  defaultSort: "-createdAt",
  access: {
    // Dado pessoal de paroquiano — só quem está logado no admin pode ver/gerenciar.
    read: ({ req }) => Boolean(req.user),
    // Só a rota pública /api/intencoes cria registros (via Local API, que ignora
    // access control por padrão) — ninguém cria direto pelo admin.
    create: () => false,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: "nome",
      type: "text",
      required: true,
    },
    {
      name: "email",
      type: "email",
    },
    {
      name: "telefone",
      type: "text",
    },
    {
      name: "tipo",
      type: "select",
      required: true,
      options: [
        { label: "Ação de Graças", value: "acao_de_gracas" },
        { label: "Falecimento", value: "falecimento" },
        { label: "Saúde", value: "saude" },
        { label: "Outra", value: "outra" },
      ],
    },
    {
      name: "intencao",
      type: "textarea",
      required: true,
    },
    {
      name: "dataPreferida",
      type: "text",
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pendente",
      options: [
        { label: "Pendente", value: "pendente" },
        { label: "Atendida", value: "atendida" },
        { label: "Arquivada", value: "arquivada" },
      ],
    },
  ],
}
