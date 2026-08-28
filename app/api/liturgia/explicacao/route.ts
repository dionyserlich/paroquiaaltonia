import { type NextRequest, NextResponse } from "next/server"

// Segurança extra caso o modelo não siga a instrução do prompt de responder
// sem markdown. Remove só o que não tem uma representação boa em HTML leve
// (tabela, linha separadora, bloco de código, marcador de cabeçalho/citação)
// — quebraria o layout do card ou não faz sentido lido em voz alta. Negrito
// (**texto**) e listas (- item) ficam intactos de propósito: o client
// (components/explicacao-leitura.tsx) converte esses dois pra HTML de
// verdade em vez de mostrar os asteriscos/traços literais na tela.
function removerMarkdownEstrutural(texto: string): string {
  return texto
    .replace(/```[\s\S]*?```/g, "") // blocos de código
    .replace(/^\|.*\|\s*$/gm, "") // linhas de tabela
    .replace(/^[-*_]{3,}\s*$/gm, "") // linhas separadoras (---, ***)
    .replace(/^#{1,6}\s*/gm, "") // marcador de cabeçalho (mantém o texto)
    .replace(/^>\s?/gm, "") // marcador de blockquote (mantém o texto)
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

export async function POST(request: NextRequest) {
  const { tipo, referencia, titulo, texto } = await request.json()

  try {
    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
      console.error("GROQ_API_KEY não encontrada")
      return NextResponse.json({ error: "Configuração de API não encontrada" }, { status: 500 })
    }

    console.log("Usando API Key:", apiKey ? "Configurada" : "Não configurada")

    const prompt = `Como um padre católico experiente, forneça uma explicação pastoral e didática da seguinte ${tipo}:

Referência: ${referencia}
Título: ${titulo}

Texto: ${texto}

Por favor, explique:
1. O contexto histórico e bíblico
2. A mensagem principal e ensinamentos
3. Como aplicar essa leitura na vida cristã hoje
4. Reflexões espirituais relevantes

Mantenha a explicação acessível para fiéis de todos os níveis de conhecimento bíblico, com linguagem clara e pastoral.

Responda em parágrafos simples, como se estivesse falando diretamente com alguém. Pode usar os quatro tópicos
acima como parágrafos separados, sem numerá-los. Não use cabeçalhos (#), tabelas, blockquotes (>) nem linhas
separadoras (---). Pode usar **negrito** com moderação só pra destacar um termo ou ideia central, e uma lista
com "- " quando fizer sentido — nada além disso de formatação.`

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // llama-3.1-8b-instant foi descontinuado pela Groq (404
        // model_not_found) — confirmado testando direto contra a API antes
        // de trocar. gpt-oss-20b é o substituto mais próximo em porte/uso
        // hoje disponível no catálogo gratuito da Groq.
        model: "openai/gpt-oss-20b",
        messages: [
          {
            role: "system",
            content:
              "Você é um padre católico experiente e teólogo, especialista em explicar as Sagradas Escrituras de " +
              "forma pastoral e acessível para os fiéis. Responda sempre em parágrafos simples, sem cabeçalhos " +
              "(#), tabelas, blockquotes (>) ou linhas separadoras (---) — isso quebra o layout onde o texto é " +
              "exibido. Pode usar **negrito** com moderação e uma lista com \"- \" quando fizer sentido, mas " +
              "nada além disso de formatação. O texto também é lido em voz alta, então evite excesso de símbolos.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        // gpt-oss é um modelo de raciocínio — parte do orçamento de tokens
        // vai pro raciocínio interno (não visível), então precisa de mais
        // margem que um modelo comum pra não cortar a resposta no meio.
        max_tokens: 1800,
        temperature: 0.6,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Erro na API do Groq: ${response.status} - ${errorText}`)
      throw new Error(`Erro na API do Groq: ${response.status}`)
    }

    const data = await response.json()
    const explicacaoBruta = data.choices[0]?.message?.content

    if (!explicacaoBruta) {
      throw new Error("Resposta inválida da IA")
    }

    return NextResponse.json({ explicacao: removerMarkdownEstrutural(explicacaoBruta) })
  } catch (error) {
    console.error("Erro ao gerar explicação:", error)

    // Fallback com explicação básica
    const explicacaoFallback = `Esta é uma ${tipo.toLowerCase()} da liturgia de hoje.
  
Referência: ${referencia}

Para uma compreensão mais profunda desta passagem, recomendamos:
- Consultar um comentário bíblico
- Conversar com seu pároco
- Participar de grupos de estudo bíblico

A liturgia nos convida à reflexão e ao crescimento espiritual através da Palavra de Deus.`

    return NextResponse.json({
      explicacao: explicacaoFallback,
      isFallback: true,
    })
  }
}
