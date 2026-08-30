import type { CollectionConfig } from "payload"

// Envio público sem login, mesmo modelo de collections/Intencoes.ts — travada
// no access, só as rotas em app/api/velas/* criam/alteram via Local API
// (que ignora access control por padrão).
export const Velas: CollectionConfig = {
  slug: "velas",
  admin: {
    useAsTitle: "nome",
    defaultColumns: ["nome", "duracaoHoras", "expiraEm", "extinta", "createdAt"],
  },
  defaultSort: "-createdAt",
  access: {
    // Leitura pública de verdade só via /api/velas/publicas (que redige os
    // campos privados por documento) — bloquear aqui é uma segunda camada
    // de proteção pro ownershipToken, que nunca deve vazar por REST direto.
    read: ({ req }) => Boolean(req.user),
    create: () => false,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: "nome", type: "text", required: true },
    { name: "nomePrivado", type: "checkbox", defaultValue: false },
    { name: "intencao", type: "textarea", required: true },
    { name: "intencaoPrivada", type: "checkbox", defaultValue: false },
    // Sigilo próprio, separado do nome/intenção — a pessoa pode querer
    // mostrar a foto mas não o nome, ou vice-versa.
    { name: "foto", type: "upload", relationTo: "media" },
    { name: "fotoPrivada", type: "checkbox", defaultValue: false },
    {
      name: "duracaoHoras",
      type: "select",
      required: true,
      options: [
        { label: "3 horas", value: "3" },
        { label: "7 horas", value: "7" },
        { label: "1 dia", value: "24" },
        { label: "7 dias", value: "168" },
      ],
    },
    { name: "expiraEm", type: "date", required: true, admin: { readOnly: true } },
    {
      name: "ownershipToken",
      type: "text",
      required: true,
      unique: true,
      admin: { readOnly: true, disableListColumn: true },
    },
    { name: "extinta", type: "checkbox", defaultValue: false },
    { name: "extintaEm", type: "date" },
    // Endpoint da inscrição push de quem acendeu, só se ela já tinha (ou
    // ativou na hora) notificações — usado exclusivamente pra avisar essa
    // pessoa, e só ela, quando a vela dela apagar. Nunca exposto por
    // /api/velas/publicas.
    { name: "notifyEndpoint", type: "text", admin: { readOnly: true, disableListColumn: true } },
  ],
}
