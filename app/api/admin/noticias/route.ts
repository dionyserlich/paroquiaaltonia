import { NextResponse } from "next/server"
import { getGithubConfig, isGithubConfigured } from "@/app/utils/githubConfig"

// Função para obter o conteúdo de um arquivo do GitHub
async function getFileContent(path: string, config: ReturnType<typeof getGithubConfig>) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}?ref=${config.branch}`,
      {
        headers: {
          Authorization: `token ${config.token}`,
          Accept: "application/vnd.github.v3+json",
        },
      },
    )

    if (!response.ok) {
      console.error("Erro ao obter arquivo do GitHub:", await response.text())
      throw new Error(`Erro ao obter arquivo: ${response.status}`)
    }

    const data = await response.json()
    return {
      content: JSON.parse(Buffer.from(data.content, "base64").toString()),
      sha: data.sha,
    }
  } catch (error) {
    console.error("Erro ao obter conteúdo do arquivo:", error)
    throw error
  }
}

// Função para atualizar um arquivo no GitHub
async function updateFile(
  path: string,
  content: any,
  sha: string,
  message: string,
  config: ReturnType<typeof getGithubConfig>,
) {
  try {
    const response = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${config.token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        content: Buffer.from(JSON.stringify(content, null, 2)).toString("base64"),
        sha,
        branch: config.branch,
      }),
    })

    if (!response.ok) {
      console.error("Erro ao atualizar arquivo no GitHub:", await response.text())
      throw new Error(`Erro ao atualizar arquivo: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Erro ao atualizar arquivo:", error)
    throw error
  }
}

export async function POST(request: Request) {
  try {
    // Obter configuração do GitHub
    const config = getGithubConfig()

    // Verificar se o GitHub está configurado
    if (!isGithubConfigured(config)) {
      return NextResponse.json(
        {
          error: "GitHub não configurado. Configure as variáveis de ambiente GITHUB_OWNER, GITHUB_REPO e GITHUB_TOKEN.",
        },
        { status: 500 },
      )
    }

    const data = await request.json()

    // Validar dados
    if (!data.titulo || !data.resumo || !data.conteudo) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    // Obter arquivo existente
    const { content: noticias, sha } = await getFileContent("data/ultimasNoticias.json", config)

    // Gerar novo ID
    const newId = noticias.length > 0 ? Math.max(...noticias.map((n: any) => n.id)) + 1 : 1

    // Adicionar nova notícia
    const novaNoticia = {
      ...data,
      id: newId,
      data: data.data || new Date().toISOString(), // Usar data fornecida ou data atual
    }

    noticias.push(novaNoticia)

    // Atualizar arquivo no GitHub
    const updateResult = await updateFile(
      "data/ultimasNoticias.json",
      noticias,
      sha,
      `Adicionar nova notícia: ${data.titulo}`,
      config,
    )

    return NextResponse.json({
      ...novaNoticia,
      _commit: {
        sha: updateResult.commit.sha,
        message: updateResult.commit.message,
        url: updateResult.commit.html_url,
      },
    })
  } catch (error: any) {
    console.error("Erro ao adicionar notícia:", error)
    return NextResponse.json({ error: error.message || "Erro interno do servidor" }, { status: 500 })
  }
}
