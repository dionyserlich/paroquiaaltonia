import type { CollectionConfig } from "payload"

export const Missas: CollectionConfig = {
  slug: "missas",
  admin: {
    useAsTitle: "titulo",
    defaultColumns: ["titulo", "inicio", "fim"],
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        if (operation !== "create" || !data) return data
        // O bot (live-mass-bot.ts) só cria o registro depois de confirmar
        // via YouTube API que a live está no ar agora — sempre notifica,
        // mesmo se `inicio` (horário oficial da missa) ainda não chegou
        // (transmissão começou um pouco adiantada). Sinalizado via
        // context em vez de inferir pelo horário, pra não depender de
        // heurística de data nesse caminho.
        const fromBot = req.context?.fromBot === true
        const now = Date.now()
        const inicio = data.inicio ? new Date(data.inicio).getTime() : null
        const fim = data.fim ? new Date(data.fim).getTime() : null
        // `fim` em branco significa "ainda ao vivo/em aberto" (o bot cadastra
        // assim de propósito — ver app/lib/live-mass-bot.ts — e só preenche
        // depois que a transmissão realmente termina), não "não sei".
        const isCurrentlyLive = inicio !== null && inicio <= now && (fim === null || now <= fim)
        data.notificado = fromBot || isCurrentlyLive
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation }) => {
        // Só dispara no create, e só quando beforeChange já marcou
        // notificado=true (bot confirmou live, ou `inicio` já chegou).
        // Cadastro manual com `inicio` no futuro (ex.: live já agendada no
        // YouTube com antecedência) fica com notificado=false aqui — quem
        // avisa quando a hora chegar é notifyDueManualMissas(), chamada a
        // cada tick do cron de 5 min (ver app/lib/live-mass-bot.ts e
        // app/api/cron/check-live-mass/route.ts).
        if (operation !== "create" || !doc.notificado) return doc
        try {
          const { sendNotificationToAll } = await import("@/app/actions")
          await sendNotificationToAll("Missa ao vivo agora!", doc.titulo, "/")
        } catch (err) {
          console.error("[missas] falha ao enviar notificação push:", err)
        }
        return doc
      },
    ],
  },
  fields: [
    {
      // Controle interno — nunca editado manualmente. Evita reenviar a
      // notificação da mesma missa a cada tick do cron (ver
      // notifyDueManualMissas) e diferencia "já notificado no cadastro" de
      // "ainda aguardando o horário chegar".
      name: "notificado",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "Preenchido automaticamente — indica se a notificação push já foi enviada.",
      },
    },
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
      name: "inicio",
      type: "date",
      required: true,
      admin: {
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
    },
    {
      // Opcional de propósito: o bot cria a missa só com `inicio` (horário
      // real em que a live foi detectada) e deixa `fim` em branco enquanto a
      // transmissão continua — só preenche quando ela de fato termina (ver
      // app/lib/live-mass-bot.ts). Em branco = "ainda ao vivo", não "erro".
      name: "fim",
      type: "date",
      admin: {
        date: {
          pickerAppearance: "dayAndTime",
        },
        description: "Deixe em branco enquanto a missa ainda está ao vivo/em andamento.",
      },
    },
    {
      // Lido pelo fallback de components/live-mass-button.tsx — manter o nome do campo.
      name: "linkEmbed",
      type: "text",
    },
    {
      name: "descricao",
      type: "textarea",
    },
  ],
}
