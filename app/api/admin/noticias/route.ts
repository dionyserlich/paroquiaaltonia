import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import { getGithubConfig, isGithubConfigured } from "@/app/utils/githubConfig"

// Função para salvar o arquivo no GitHub
async function saveFileToGitHub(content: string) {
  const config = getGithubConfig()

  if (!isGithubConfigured(config)) {
    throw new Error("GitHub não configurado")
  }

  const filePath = "data/noticias.json"
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}`

  // Primeiro, obter o SHA do arquivo atual
  const getResponse = await fetch(url, {
    headers: {
      Authorization: `token ${config.token}`,
      "Content-Type": "application/json",
    },
  })

  let sha = ""
  if (getResponse.ok) {
    const fileData = await getResponse.json()
    sha = fileData.sha
  }

  // Agora, atualizar o arquivo
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `token ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "Atualização de notícias",
      content: Buffer.from(content).toString("base64"),
      sha: sha || undefined,
      branch: config.branch,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Erro ao salvar arquivo no GitHub: ${error}`)
  }

  return response.json()
}

// GET - Listar todas as notícias
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "noticias.json")

    if (!fs.existsSync(filePath)) {
      return NextResponse.json([])
    }

    const fileContents = fs.readFileSync(filePath, "utf8")
    const noticias = JSON.parse(fileContents)

    // Ordenar por data (mais recente primeiro)
    noticias.sort((a: any, b: any) => new Date(b.data).getTime() - new Date(a.data).getTime())

    return NextResponse.json(noticias)
  } catch (error) {
    console.error("Erro ao buscar notícias:", error)
    return NextResponse.json([], { status: 500 })
  }
}

// POST - Criar uma nova notícia
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const filePath = path.join(process.cwd(), "data", "noticias.json")

    // Validar dados
    if (!data.titulo || !data.conteudo) {
      return NextResponse.json({ error: "Título e conteúdo são obrigatórios" }, { status: 400 })
    }

    // Ler arquivo existente ou criar novo
    let noticias = []
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, "utf8")
      noticias = JSON.parse(fileContents)
    }

    // Criar nova notícia
    const novaNoticia = {
      id: uuidv4(),
      titulo: data.titulo,
      conteudo: data.conteudo,
      imagem: data.imagem || "",
      data: data.data || new Date().toISOString(),
      destaque: data.destaque || false,
    }

    // Adicionar à lista
    noticias.push(novaNoticia)

    // Salvar no arquivo local
    fs.writeFileSync(filePath, JSON.stringify(noticias, null, 2))

    // Salvar no GitHub se configurado
    try {
      await saveFileToGitHub(JSON.stringify(noticias, null, 2))
    } catch (githubError) {
      console.error("Erro ao salvar no GitHub:", githubError)
      // Continua mesmo com erro no GitHub, pois já salvou localmente
    }

    return NextResponse.json(novaNoticia, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar notícia:", error)
    return NextResponse.json({ error: "Erro ao criar notícia" }, { status: 500 })
  }
}
