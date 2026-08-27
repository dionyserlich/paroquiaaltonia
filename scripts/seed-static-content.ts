// Popula os Globals com o conteúdo que hoje está hardcoded em TSX
// (app/(frontend)/{horarios,sobre,dizimo}/*-content.tsx e
// app/lib/mass-schedule.ts). Roda uma vez, via rota temporária, pelo mesmo
// motivo de scripts/migrate-to-payload.ts (bug de interop ESM/CJS fora do
// runtime do Next).
import type { Payload } from "payload"

const richText = (text: string) => ({
  root: {
    type: "root",
    children: [
      {
        type: "paragraph",
        children: [{ type: "text", text, format: 0, detail: 0, mode: "normal", style: "", version: 1 }],
        direction: "ltr",
        format: "",
        indent: 0,
        version: 1,
      },
    ],
    direction: "ltr",
    format: "",
    indent: 0,
    version: 1,
  },
})

export async function seedStaticContent(payload: Payload) {
  // --- MassSchedule (fonte única para /horarios e o bot) ---
  await payload.updateGlobal({
    slug: "mass-schedule",
    data: {
      horarios: [
        { diaSemana: "1", hora: 7, minuto: 30, label: "Missa de segunda 07h30" },
        { diaSemana: "2", hora: 7, minuto: 30, label: "Missa de terça 07h30" },
        { diaSemana: "3", hora: 7, minuto: 30, label: "Missa de quarta 07h30" },
        { diaSemana: "4", hora: 7, minuto: 30, label: "Missa de quinta 07h30" },
        { diaSemana: "5", hora: 7, minuto: 30, label: "Missa de sexta 07h30" },
        { diaSemana: "1", hora: 20, minuto: 0, label: "Missa de segunda 20h00" },
        { diaSemana: "2", hora: 20, minuto: 0, label: "Missa de terça 20h00" },
        { diaSemana: "3", hora: 20, minuto: 0, label: "Missa de quarta 20h00" },
        { diaSemana: "4", hora: 20, minuto: 0, label: "Missa de quinta 20h00" },
        { diaSemana: "5", hora: 20, minuto: 0, label: "Missa de sexta 20h00" },
        { diaSemana: "6", hora: 20, minuto: 0, label: "Missa de sábado 20h00" },
        { diaSemana: "0", hora: 8, minuto: 30, label: "Missa de domingo 08h30" },
        { diaSemana: "0", hora: 10, minuto: 30, label: "Missa de domingo 10h30" },
        { diaSemana: "0", hora: 18, minuto: 0, label: "Missa de domingo 18h00" },
      ],
    },
  })

  // --- ContactInfo ---
  await payload.updateGlobal({
    slug: "contact-info",
    data: {
      telefone: "+554436591110",
      whatsapp: "5544998680244",
      email: "paroquia_altonia@hotmail.com",
      endereco: "Rua da Bandeira, 426 – Centro, Altônia – PR, CEP: 87550-000",
    },
  })

  // --- Horarios (complementares à grade regular) ---
  await payload.updateGlobal({
    slug: "horarios",
    data: {
      missasEspeciais: [
        { descricao: "1ª Sexta-feira do mês (Apostolado da Oração)", horario: "20h00" },
        { descricao: "3ª Quarta-feira do mês (RCC)", horario: "20h00" },
        { descricao: "4ª Sexta-feira do mês (Enfermos)", horario: "15h00" },
      ],
      horarioSecretaria: "Segunda à sexta-feira: 08h00 às 12h00 e 13h30 às 18h00",
      atendimentoPadres: "Segunda, quarta e sexta-feira: 08h30 às 12h00\nQuinta-feira: 08h30 às 12h00 e 19h30 às 21h00",
      confissoes: "Segunda-feira: 15h00 às 18h00\nLocal: Igreja Matriz",
      observacao:
        "Os horários podem sofrer alterações em datas especiais. Consulte nossos canais de comunicação para confirmações.",
    },
  })

  // --- Sobre ---
  await payload.updateGlobal({
    slug: "sobre",
    data: {
      introducao:
        "A Paróquia São Sebastião de Altônia é um marco de fé, perseverança e compromisso comunitário no noroeste do Paraná. Desde sua fundação em 1º de maio de 1969, por Dom Elizeu Simões Mendes, então bispo de Campo Mourão, a paróquia tem sido um pilar espiritual para a população local, mesmo antes da criação da Diocese de Umuarama em 1973.",
      timeline: [
        {
          titulo: "As raízes missionárias",
          badge: "1969-1977",
          texto:
            "Nos primeiros anos, a paróquia foi confiada aos Padres de São Tiago, missionários franceses com experiência no Haiti. Eles desempenharam um papel crucial na organização das primeiras comunidades e na formação de líderes leigos. Com a criação da Diocese de Umuarama, muitos desses padres permaneceram na região até serem enviados para missões no norte do Brasil. Em 1977, a Congregação de São João Batista, o Precursor, assumiu a paróquia, introduzindo as Comunidades Neocatecumenais e fortalecendo diversas pastorais em sintonia com a pastoral diocesana.",
        },
        {
          titulo: "Crescimento e evangelização",
          badge: "Missão",
          texto:
            "A Paróquia São Sebastião sempre se destacou por seu trabalho missionário, especialmente com aqueles afastados da fé ou que nunca participaram da vida eclesial. Por meio de catequeses para jovens e adultos, muitos têm recebido os sacramentos da iniciação cristã, fortalecendo a comunidade e promovendo uma fé viva e atuante.",
        },
        {
          titulo: "Celebrações e tradições",
          badge: "20 de Janeiro",
          texto:
            "A festa do padroeiro, São Sebastião, celebrada em 20 de janeiro, é um dos eventos mais aguardados do calendário religioso local. As comemorações incluem uma semana de bênçãos temáticas, como para gestantes, pescadores, agricultores e enfermos, culminando em uma grande celebração dominical com missa, almoço comunitário, show de prêmios e leilão de gado.",
        },
        {
          titulo: "Compromisso com a comunidade",
          badge: "Pastoral",
          texto:
            "Além das celebrações litúrgicas, a paróquia mantém uma presença ativa na comunidade por meio de diversas pastorais e movimentos, como o Apostolado da Oração, Renovação Carismática Católica e celebrações específicas para os enfermos. A paróquia também está atenta às questões sociais, como demonstrado em 2021, quando alertou sobre golpes envolvendo cheques falsos em seu nome, reforçando que não realiza pagamentos por meio de cheques e orientando a população a denunciar tais práticas.",
        },
      ],
      legado:
        "A Paróquia São Sebastião de Altônia é um símbolo de fé, esperança e amor ao próximo. Sua história é marcada por desafios superados, crescimento espiritual e um compromisso inabalável com a evangelização e o serviço à comunidade. Com uma liderança dedicada e uma comunidade engajada, a paróquia continua a ser um farol de luz e esperança para todos que buscam uma vida de fé e comunhão.",
    },
  })

  // --- Dizimo ---
  await payload.updateGlobal({
    slug: "dizimo",
    data: {
      conteudo: richText(
        "O dízimo é uma contribuição mensal voluntária que representa nossa gratidão a Deus e nosso compromisso com a comunidade paroquial. Tradicionalmente corresponde a 10% da renda, mas o valor pode ser ajustado conforme a possibilidade de cada família.",
      ),
    },
  })

  // --- Pastorais (só roda se a collection ainda estiver vazia) ---
  const existentes = await payload.count({ collection: "pastorais" })
  if (existentes.totalDocs === 0) {
    const pastorais = [
      {
        nome: "Pastoral da Comunicação",
        descricao:
          "Responsável pela comunicação interna e externa da paróquia, redes sociais, boletins e divulgação de eventos.",
        atividades: ["Redes sociais", "Boletim paroquial", "Site da paróquia", "Comunicados"],
        icone: "message-circle",
        tema: "blue",
        ordem: 0,
      },
      {
        nome: "Pastoral da Família",
        descricao:
          "Acompanha e orienta as famílias da comunidade, promovendo valores cristãos e fortalecendo os laços familiares.",
        atividades: ["Preparação matrimonial", "Encontros familiares", "Orientação conjugal", "Batismo"],
        icone: "heart",
        tema: "pink",
        ordem: 1,
      },
      {
        nome: "Pastoral da Sobriedade",
        descricao:
          "Trabalha na prevenção e recuperação de dependências químicas, oferecendo apoio espiritual e emocional.",
        atividades: ["Grupos de apoio", "Palestras preventivas", "Acompanhamento familiar", "Oração"],
        icone: "shield",
        tema: "green",
        ordem: 2,
      },
    ]
    for (const p of pastorais) {
      await payload.create({
        collection: "pastorais",
        data: { ...p, atividades: p.atividades.map((atividade) => ({ atividade })) },
      })
    }
  }

  return { ok: true }
}
