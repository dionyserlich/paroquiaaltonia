import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
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

// GET - Obter uma notícia específica
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const filePath = path.join(process.cwd(), "data", "noticias.json")

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(null, { status: 404 })
    }

    const fileContents = fs.readFileSync(filePath, "utf8")
    const noticias = JSON.parse(fileContents)

    const noticia = noticias.find((n: any) => n.id === id)

    if (!noticia) {
      return NextResponse.json(null, { status: 404 })
    }

    return NextResponse.json(noticia)
  } catch (error) {
    console.error(`Erro ao buscar notícia ${params.id}:`, error)
    return NextResponse.json(null, { status: 500 })
  }
}

// PUT - Atualizar uma notícia
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const data = await request.json()
    const filePath = path.join(process.cwd(), "data", "noticias.json")

    // Validar dados
    if (!data.titulo || !data.conteudo) {
      return NextResponse.json({ error: "Título e conteúdo são obrigatórios" }, { status: 400 })
    }

    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Arquivo de notícias não encontrado" }, { status: 404 })
    }

    // Ler arquivo
    const fileContents = fs.readFileSync(filePath, "utf8")
    const noticias = JSON.parse(fileContents)

    // Encontrar índice da notícia
    const index = noticias.findIndex((n: any) => n.id === id)

    if (index === -1) {
      return NextResponse.json({ error: "Notícia não encontrada" }, { status: 404 })
    }

    // Atualizar notícia
    noticias[index] = {
      ...noticias[index],
      titulo: data.titulo,
      conteudo: data.conteudo,
      imagem: data.imagem !== undefined ? data.imagem : noticias[index].imagem,
      data: data.data || noticias[index].data,
      destaque: data.destaque !== undefined ? data.destaque : noticias[index].destaque,
    }

    // Salvar no arquivo local
    fs.writeFileSync(filePath, JSON.stringify(noticias, null, 2))

    // Salvar no GitHub se configurado
    try {
      await saveFileToGitHub(JSON.stringify(noticias, null, 2))
    } catch (githubError) {
      console.error("Erro ao salvar no GitHub:", githubError)
      // Continua mesmo com erro no GitHub, pois já salvou localmente
    }

    return NextResponse.json(noticias[index])
  } catch (error) {
    console.error(`Erro ao atualizar notícia ${params.id}:`, error)
    return NextResponse.json({ error: "Erro ao atualizar notícia" }, { status: 500 })
  }
}

// DELETE - Excluir uma notícia
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const filePath = path.join(process.cwd(), "data", "noticias.json")

    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Arquivo de notícias não encontrado" }, { status: 404 })
    }

    // Ler arquivo
    const fileContents = fs.readFileSync(filePath, "utf8")
    const noticias = JSON.parse(fileContents)

    // Filtrar notícias, removendo a que tem o ID especificado
    const noticiasAtualizadas = noticias.filter((n: any) => n.id !== id)

    // Verificar se alguma notícia foi removida
    if (noticiasAtualizadas.length === noticias.length) {
      return NextResponse.json({ error: "Notícia não encontrada" }, { status: 404 })
    }

    // Salvar no arquivo local
    fs.writeFileSync(filePath, JSON.stringify(noticiasAtualizadas, null, 2))

    // Salvar no GitHub se configurado
    try {
      await saveFileToGitHub(JSON.stringify(noticiasAtualizadas, null, 2))
    } catch (githubError) {
      console.error("Erro ao salvar no GitHub:", githubError)
      // Continua mesmo com erro no GitHub, pois já salvou localmente
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Erro ao excluir notícia ${params.id}:`, error)
    return NextResponse.json({ error: "Erro ao excluir notícia" }, { status: 500 })
  }
}
