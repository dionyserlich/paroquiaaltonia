import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { githubConfig } from "@/app/utils/githubConfig"

// Função para obter o conteúdo do arquivo do GitHub
async function getFileContent(filePath: string) {
  try {
    const githubFilePath = `data/noticias.json`
    const url = `https://api.github.com/repos/${githubConfig.owner}/${githubConfig.repo}/contents/${githubFilePath}?ref=${githubConfig.branch}`

    const response = await fetch(url, {
      headers: {
        Authorization: `token ${githubConfig.token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        // Se o arquivo não existir, retornar um array vazio
        return { content: "[]", sha: "" }
      }
      throw new Error(`GitHub API responded with status: ${response.status}`)
    }

    const data = await response.json()
    const content = Buffer.from(data.content, "base64").toString("utf-8")

    return { content, sha: data.sha }
  } catch (error) {
    console.error("Erro ao obter conteúdo do arquivo:", error)
    // Se houver erro, tentar ler do arquivo local
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf8")
      return { content, sha: "" }
    }
    return { content: "[]", sha: "" }
  }
}

// Função para atualizar o arquivo no GitHub
async function updateFileOnGitHub(content: string, sha: string) {
  try {
    const githubFilePath = `data/noticias.json`
    const url = `https://api.github.com/repos/${githubConfig.owner}/${githubConfig.repo}/contents/${githubFilePath}`

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `token ${githubConfig.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Atualização de notícias",
        content: Buffer.from(content).toString("base64"),
        sha: sha,
        branch: githubConfig.branch,
      }),
    })

    if (!response.ok) {
      throw new Error(`GitHub API responded with status: ${response.status}`)
    }

    return true
  } catch (error) {
    console.error("Erro ao atualizar arquivo no GitHub:", error)
    return false
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const filePath = path.join(process.cwd(), "data", "noticias.json")

    // Obter conteúdo atual do arquivo
    const { content } = await getFileContent(filePath)

    let noticias = []
    try {
      noticias = JSON.parse(content)
    } catch (e) {
      console.error("Erro ao parsear JSON:", e)
      return NextResponse.json({ error: "Erro ao ler arquivo de notícias" }, { status: 500 })
    }

    const noticia = noticias.find((n: any) => n.id === id)

    if (!noticia) {
      return NextResponse.json({ error: "Notícia não encontrada" }, { status: 404 })
    }

    return NextResponse.json(noticia)
  } catch (error) {
    console.error(`Erro ao buscar notícia ${params.id}:`, error)
    return NextResponse.json({ error: "Erro ao buscar notícia" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const data = await request.json()
    const filePath = path.join(process.cwd(), "data", "noticias.json")

    // Validar dados
    if (!data.titulo || !data.resumo || !data.conteudo) {
      return NextResponse.json({ error: "Título, resumo e conteúdo são obrigatórios" }, { status: 400 })
    }

    // Obter conteúdo atual do arquivo
    const { content, sha } = await getFileContent(filePath)

    let noticias = []
    try {
      noticias = JSON.parse(content)
    } catch (e) {
      console.error("Erro ao parsear JSON:", e)
      return NextResponse.json({ error: "Erro ao ler arquivo de notícias" }, { status: 500 })
    }

    const index = noticias.findIndex((n: any) => n.id === id)

    if (index === -1) {
      return NextResponse.json({ error: "Notícia não encontrada" }, { status: 404 })
    }

    // Atualizar notícia
    noticias[index] = {
      ...noticias[index],
      titulo: data.titulo,
      resumo: data.resumo,
      conteudo: data.conteudo,
      imagem: data.imagem || noticias[index].imagem,
      destaque: data.destaque !== undefined ? data.destaque : noticias[index].destaque,
    }

    // Salvar no GitHub
    const updatedContent = JSON.stringify(noticias, null, 2)
    const updated = await updateFileOnGitHub(updatedContent, sha)

    if (!updated) {
      return NextResponse.json({ error: "Erro ao salvar notícia no GitHub" }, { status: 500 })
    }

    // Salvar localmente também
    try {
      fs.writeFileSync(filePath, updatedContent)
    } catch (e) {
      console.error("Erro ao salvar arquivo localmente:", e)
    }

    return NextResponse.json(noticias[index])
  } catch (error) {
    console.error(`Erro ao atualizar notícia ${params.id}:`, error)
    return NextResponse.json({ error: "Erro ao atualizar notícia" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const filePath = path.join(process.cwd(), "data", "noticias.json")

    // Obter conteúdo atual do arquivo
    const { content, sha } = await getFileContent(filePath)

    let noticias = []
    try {
      noticias = JSON.parse(content)
    } catch (e) {
      console.error("Erro ao parsear JSON:", e)
      return NextResponse.json({ error: "Erro ao ler arquivo de notícias" }, { status: 500 })
    }

    const index = noticias.findIndex((n: any) => n.id === id)

    if (index === -1) {
      return NextResponse.json({ error: "Notícia não encontrada" }, { status: 404 })
    }

    // Remover notícia
    noticias.splice(index, 1)

    // Salvar no GitHub
    const updatedContent = JSON.stringify(noticias, null, 2)
    const updated = await updateFileOnGitHub(updatedContent, sha)

    if (!updated) {
      return NextResponse.json({ error: "Erro ao excluir notícia no GitHub" }, { status: 500 })
    }

    // Salvar localmente também
    try {
      fs.writeFileSync(filePath, updatedContent)
    } catch (e) {
      console.error("Erro ao salvar arquivo localmente:", e)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Erro ao excluir notícia ${params.id}:`, error)
    return NextResponse.json({ error: "Erro ao excluir notícia" }, { status: 500 })
  }
}
