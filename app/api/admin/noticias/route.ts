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
    const content = Buffer.from(data.sha ? data.content : "W10=", "base64").toString("utf-8")

    return { content, sha: data.sha || "" }
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

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "noticias.json")
    const { content } = await getFileContent(filePath)

    let noticias = []
    try {
      noticias = JSON.parse(content)
    } catch (e) {
      console.error("Erro ao parsear JSON:", e)
      noticias = []
    }

    // Ordenar por data (mais recente primeiro)
    noticias.sort((a: any, b: any) => {
      return new Date(b.data).getTime() - new Date(a.data).getTime()
    })

    return NextResponse.json(noticias)
  } catch (error) {
    console.error("Erro ao buscar notícias:", error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
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
      noticias = []
    }

    // Gerar ID único
    const maxId = noticias.reduce((max: number, noticia: any) => {
      const id = Number.parseInt(noticia.id)
      return isNaN(id) ? max : Math.max(max, id)
    }, 0)

    const newId = (maxId + 1).toString()

    // Criar nova notícia
    const novaNoticia = {
      id: newId,
      titulo: data.titulo,
      resumo: data.resumo,
      conteudo: data.conteudo,
      imagem: data.imagem || "/placeholder.svg?height=600&width=800",
      data: data.data || new Date().toISOString(),
      destaque: data.destaque || false,
    }

    // Adicionar à lista
    noticias.push(novaNoticia)

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

    return NextResponse.json(novaNoticia, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar notícia:", error)
    return NextResponse.json({ error: "Erro ao criar notícia" }, { status: 500 })
  }
}
