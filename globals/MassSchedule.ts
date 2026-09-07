import type { GlobalConfig } from "payload"

// Fonte única de verdade para o horário semanal de missas — lida tanto por
// /horarios (exibição) quanto por app/lib/mass-schedule.ts (janela do bot
// de missa ao vivo). Antes havia duas cópias divergentes desse horário.
export const MassSchedule: GlobalConfig = {
  slug: "mass-schedule",
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "horarios",
      type: "array",
      fields: [
        {
          name: "diaSemana",
          type: "select",
          required: true,
          options: [
            { label: "Domingo", value: "0" },
            { label: "Segunda-feira", value: "1" },
            { label: "Terça-feira", value: "2" },
            { label: "Quarta-feira", value: "3" },
            { label: "Quinta-feira", value: "4" },
            { label: "Sexta-feira", value: "5" },
            { label: "Sábado", value: "6" },
          ],
        },
        {
          name: "hora",
          type: "number",
          required: true,
          min: 0,
          max: 23,
          admin: {
            description: "Hora (0-23)",
          },
        },
        {
          name: "minuto",
          type: "number",
          required: true,
          min: 0,
          max: 59,
          defaultValue: 0,
        },
        {
          name: "label",
          type: "text",
          required: true,
        },
      ],
    },
    {
      // Missas fora da grade semanal — feriado, festa, encerramento de
      // encontro. Sem isto o bot de missa ao vivo só procura transmissão nos
      // horários fixos e ignora uma missa especial mesmo estando no ar, que
      // foi o que aconteceu no 7 de setembro de 2026.
      name: "especiais",
      type: "array",
      labels: { singular: "Missa especial", plural: "Missas especiais" },
      admin: {
        description:
          "Missas avulsas, em datas que não seguem o horário semanal. O bot passa a procurar a transmissão ao vivo nesse horário, como faz com as missas fixas. Datas passadas podem ser removidas quando quiser — elas são ignoradas sozinhas.",
      },
      fields: [
        {
          name: "dataHora",
          type: "date",
          required: true,
          admin: {
            date: { pickerAppearance: "dayAndTime", timeFormat: "HH:mm" },
            description: "Data e horário de início da missa (horário de Brasília).",
          },
        },
        {
          name: "label",
          type: "text",
          required: true,
          admin: { description: "Nome que aparece nos registros, ex.: “Missa de 7 de setembro”." },
        },
      ],
    },
  ],
}
