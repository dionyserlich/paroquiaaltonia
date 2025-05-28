import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { tipo, referencia, titulo, texto } = await request.json()

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

Mantenha a explicação acessível para fiéis de todos os níveis de conhecimento bíblico, com linguagem clara e pastoral.`

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant", // Modelo mais leve e confiável
        messages: [
          {
            role: "system",
            content:
              "Você é um padre católico experiente e teólogo, especialista em explicar as Sagradas Escrituras de forma pastoral e acessível para os fiéis.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Erro na API do Groq: ${response.status} - ${errorText}`)
      throw new Error(`Erro na API do Groq: ${response.status}`)
    }

    const data = await response.json()
    const explicacao = data.choices[0]?.message?.content

    if (!explicacao) {
      throw new Error("Resposta inválida da IA")
    }

    return NextResponse.json({ explicacao })
  } catch (error) {
    console.error("Erro ao gerar explicação:", error)

    // Fallback com explicação básica
    const { tipo, referencia } = await request.json()
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
