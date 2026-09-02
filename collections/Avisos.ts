import type { CollectionConfig } from "payload"

// Envio manual de notificação push pelo CMS, para avisos que não nascem de
// uma notícia, evento ou missa (mudança de horário, convocação, recado
// urgente da paróquia).
//
// Duas travas de segurança, porque um envio é irreversível e vai pra todo
// mundo: nada é enviado enquanto "enviarAgora" não for marcado, e um aviso
// já enviado nunca reenvia, mesmo que o registro seja editado depois.
export const Avisos: CollectionConfig = {
  slug: "avisos",
  labels: { singular: "Aviso", plural: "Avisos" },
  admin: {
    useAsTitle: "titulo",
    defaultColumns: ["titulo", "enviado", "enviadoEm", "enviadas", "falhas"],
    description:
      "Envia uma notificação push para todos os aparelhos inscritos. Preencha, revise e só então marque “Enviar agora”. Não há como cancelar depois.",
    group: "Comunicação",
  },
  defaultSort: "-createdAt",
  // Só quem está logado no CMS — diferente de notícias/eventos, isto nunca
  // é conteúdo público.
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    // beforeChange, e não afterChange, de propósito: o resultado do envio é
    // gravado na MESMA escrita que já está acontecendo.
    //
    // A primeira versão disparava em afterChange e depois chamava
    // payload.update() no próprio registro. Como o afterChange roda dentro
    // da transação da gravação, esse update abria uma segunda transação que
    // ficava esperando a primeira soltar a linha — deadlock: a notificação
    // era enviada, mas a transação inteira era revertida depois de ~90s e o
    // aviso ficava marcado como não enviado. Aqui só existe uma escrita,
    // então o problema não pode acontecer.
    beforeChange: [
      async ({ data, originalDoc }) => {
        // Em um update, `data` traz só os campos alterados — por isso cada
        // leitura cai de volta no registro original.
        const jaEnviado = data.enviado ?? originalDoc?.enviado
        if (jaEnviado) return data // nunca reenvia, mesmo se editado depois
        const querEnviar = data.enviarAgora ?? originalDoc?.enviarAgora
        if (!querEnviar) return data // ainda é rascunho

        const titulo = data.titulo ?? originalDoc?.titulo
        const mensagem = data.mensagem ?? originalDoc?.mensagem
        if (!titulo || !mensagem) return data

        let enviadas = 0
        let falhas = 0
        try {
          const { sendNotificationToAll } = await import("@/app/actions")
          const resultado = await sendNotificationToAll(
            titulo,
            mensagem,
            data.url ?? originalDoc?.url ?? "/",
            {
              ttlSegundos: (data.ttlHoras ?? originalDoc?.ttlHoras ?? 24) * 3600,
              urgencia: data.urgencia ?? originalDoc?.urgencia ?? "normal",
              topico: (data.topico ?? originalDoc?.topico) || undefined,
              tag: (data.tag ?? originalDoc?.tag) || undefined,
            }
          )
          if ("sent" in resultado) enviadas = resultado.sent ?? 0
          if ("failed" in resultado) falhas = resultado.failed ?? 0
        } catch (err) {
          console.error("[avisos] falha ao enviar notificação push:", err)
          falhas = -1 // distingue "erro no disparo" de "nenhuma falha"
        }

        return {
          ...data,
          enviado: true,
          enviarAgora: false,
          enviadoEm: new Date().toISOString(),
          enviadas,
          falhas,
        }
      },
    ],
  },
  fields: [
    {
      name: "titulo",
      type: "text",
      required: true,
      maxLength: 60,
      admin: {
        description: "Aparece em negrito na notificação. Acima de ~50 caracteres o celular corta o final.",
      },
    },
    {
      name: "mensagem",
      type: "textarea",
      required: true,
      maxLength: 200,
      admin: {
        description: "Corpo da notificação. Acima de ~120 caracteres costuma ser cortado.",
      },
    },
    {
      name: "url",
      type: "text",
      defaultValue: "/",
      admin: {
        description: "Para onde leva ao tocar na notificação. Use um caminho do site, como /eventos ou /velas.",
      },
      validate: (value: string | null | undefined) => {
        if (!value) return true
        return value.startsWith("/") || "Use um caminho interno começando com / (ex.: /eventos)."
      },
    },
    {
      type: "collapsible",
      label: "Opções de entrega",
      admin: {
        description: "Os padrões servem para a maioria dos avisos. Ajuste só se souber o que precisa.",
      },
      fields: [
        {
          name: "urgencia",
          type: "select",
          defaultValue: "normal",
          options: [
            { label: "Alta — entrega imediata, acorda o aparelho", value: "high" },
            { label: "Normal — padrão", value: "normal" },
            { label: "Baixa — pode esperar, poupa bateria", value: "low" },
            { label: "Muito baixa — só quando o aparelho já estiver ativo", value: "very-low" },
          ],
          admin: {
            description: "Use “Alta” só para o que é realmente urgente, como uma missa começando agora.",
          },
        },
        {
          name: "ttlHoras",
          type: "number",
          defaultValue: 24,
          min: 1,
          max: 672,
          admin: {
            description:
              "Por quantas horas o aviso continua valendo se o aparelho estiver desligado. Passado esse prazo ele é descartado em vez de chegar atrasado. Máximo: 672 (4 semanas).",
          },
        },
        {
          name: "topico",
          type: "text",
          maxLength: 32,
          admin: {
            description:
              "Opcional. Avisos com o mesmo tópico substituem o anterior que ainda não foi entregue, em vez de acumular. Útil para avisos que se atualizam.",
          },
        },
        {
          name: "tag",
          type: "text",
          maxLength: 32,
          admin: {
            description:
              "Opcional. Mesma ideia do tópico, mas na bandeja do aparelho: um aviso com a mesma tag substitui o anterior já exibido.",
          },
        },
      ],
    },
    {
      name: "enviarAgora",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description: "Marque e salve para disparar. O envio é imediato e não pode ser desfeito.",
        condition: (data) => !data?.enviado,
      },
    },
    {
      name: "enviado",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar", readOnly: true },
    },
    {
      name: "enviadoEm",
      type: "date",
      admin: { position: "sidebar", readOnly: true },
    },
    {
      name: "enviadas",
      type: "number",
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "Aparelhos que receberam.",
      },
    },
    {
      name: "falhas",
      type: "number",
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "Envios que falharam. -1 indica erro geral no disparo.",
      },
    },
  ],
}
