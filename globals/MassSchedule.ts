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
  ],
}
