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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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

    const id = Number.parseInt(params.id)
    const data = await request.json()

    // Validar dados
    if (!data.titulo || !data.inicio || !data.fim || !data.linkEmbed) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    // Obter arquivo existente
    const { content: missas, sha } = await getFileContent("data/missas.json", config)

    // Encontrar índice da missa a ser atualizada
    const index = missas.findIndex((m: any) => m.id === id)

    if (index === -1) {
      return NextResponse.json({ error: "Missa não encontrada" }, { status: 404 })
    }

    // Atualizar missa
    missas[index] = {
      ...data,
      id,
    }

    // Atualizar arquivo no GitHub
    const updateResult = await updateFile("data/missas.json", missas, sha, `Atualizar missa: ${data.titulo}`, config)

    return NextResponse.json({
      ...missas[index],
      _commit: {
        sha: updateResult.commit.sha,
        message: updateResult.commit.message,
        url: updateResult.commit.html_url,
      },
    })
  } catch (error: any) {
    console.error("Erro ao atualizar missa:", error)
    return NextResponse.json({ error: error.message || "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

    const id = Number.parseInt(params.id)

    // Obter arquivo existente
    const { content: missas, sha } = await getFileContent("data/missas.json", config)

    // Encontrar missa a ser excluída
    const missa = missas.find((m: any) => m.id === id)

    if (!missa) {
      return NextResponse.json({ error: "Missa não encontrada" }, { status: 404 })
    }

    // Filtrar missas, removendo a que tem o ID especificado
    const novasMissas = missas.filter((m: any) => m.id !== id)

    // Atualizar arquivo no GitHub
    const updateResult = await updateFile(
      "data/missas.json",
      novasMissas,
      sha,
      `Excluir missa: ${missa.titulo}`,
      config,
    )

    return NextResponse.json({
      success: true,
      _commit: {
        sha: updateResult.commit.sha,
        message: updateResult.commit.message,
        url: updateResult.commit.html_url,
      },
    })
  } catch (error: any) {
    console.error("Erro ao excluir missa:", error)
    return NextResponse.json({ error: error.message || "Erro interno do servidor" }, { status: 500 })
  }
}
