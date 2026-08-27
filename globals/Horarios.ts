import type { GlobalConfig } from "payload"

// A grade regular de missas vem do global MassSchedule (fonte única também
// usada pelo bot). Aqui ficam só as informações complementares da página
// /horarios que não fazem parte do agendamento — texto simples, sem tentar
// reproduzir cada card/ícone como campo estruturado (ver decisão do time).
export const Horarios: GlobalConfig = {
  slug: "horarios",
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "missasEspeciais",
      type: "array",
      labels: { singular: "Missa especial", plural: "Missas especiais" },
      fields: [
        { name: "descricao", type: "text", required: true },
        { name: "horario", type: "text", required: true },
      ],
    },
    {
      name: "horarioSecretaria",
      type: "textarea",
      admin: { description: "Ex: Segunda à sexta-feira: 08h00 às 12h00 / 13h30 às 18h00" },
    },
    {
      name: "atendimentoPadres",
      type: "textarea",
    },
    {
      name: "confissoes",
      type: "textarea",
    },
    {
      name: "observacao",
      type: "textarea",
    },
  ],
}
