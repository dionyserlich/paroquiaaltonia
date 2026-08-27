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
    // Id do registro no banco antigo (só continuidade de auditoria — a
    // rota pública de intenções não expõe URL por id individual).
    {
      name: "legacyId",
      type: "number",
      unique: true,
      admin: { readOnly: true },
    },
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
      // Valores idênticos ao que o formulário público em /intencoes já envia
      // (app/(frontend)/intencoes/intencoes-content.tsx) — strings em português,
      // sem slug, para não exigir tradução na migração nem na rota pública.
      name: "tipo",
      type: "select",
      required: true,
      options: [
        "Aniversário e Nascimento",
        "Aniversário de Casamento",
        "Ação de Graças",
        "Enfermos",
        "Falecimento",
        "Outros",
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
