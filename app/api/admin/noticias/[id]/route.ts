import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { getGithubConfig, isGithubConfigured } from "@/app/utils/githubConfig"

// Caminho do arquivo de notícias
const noticiasFilePath = path.join(process.cwd(), "data", "noticias.json")

// Função para garantir que o arquivo exista
function ensureFileExists() {
  const dir = path.dirname(noticiasFilePath)

  // Criar diretório se não existir
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  // Criar arquivo se não existir
  if (!fs.existsSync(noticiasFilePath)) {
    fs.writeFileSync(noticiasFilePath, "[]", "utf8")
  }
}

// Função para ler notícias
function readNoticias() {
  ensureFileExists()

  try {
    const data = fs.readFileSync(noticiasFilePath, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error("Erro ao ler arquivo de notícias:", error)
    return []
  }
}

// Função para salvar notícias
function saveNoticias(noticias: any[]) {
  ensureFileExists()

  try {
    fs.writeFileSync(noticiasFilePath, JSON.stringify(noticias, null, 2), "utf8")
    return true
  } catch (error) {
    console.error("Erro ao salvar arquivo de notícias:", error)
    return false
  }
}

// Função para salvar o arquivo no GitHub
async function saveFileToGitHub(content: string) {
  try {
    const config = getGithubConfig()

    if (!isGithubConfigured(config)) {
      console.log("GitHub não configurado, pulando sincronização")
      return true
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
      console.error(`Erro ao salvar arquivo no GitHub: ${error}`)
      return false
    }

    return true
  } catch (error) {
    console.error("Erro ao salvar no GitHub:", error)
    return false
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const noticias = readNoticias()

    const noticia = noticias.find((n: any) => n.id === id)

    if (!noticia) {
      return NextResponse.json({ error: "Notícia não encontrada" }, { status: 404 })
    }

    return NextResponse.json(noticia)
  } catch (error) {
    console.error(`Erro ao buscar notícia ${params.id}:`, error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const data = await request.json()

    // Validar dados
    if (!data.titulo || !data.conteudo) {
      return NextResponse.json({ error: "Título e conteúdo são obrigatórios" }, { status: 400 })
    }

    const noticias = readNoticias()

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

    // Salvar arquivo
    const saved = saveNoticias(noticias)

    if (!saved) {
      return NextResponse.json({ error: "Erro ao salvar notícia" }, { status: 500 })
    }

    // Tentar salvar no GitHub, mas não falhar se não conseguir
    saveFileToGitHub(JSON.stringify(noticias, null, 2)).catch((error) =>
      console.error("Erro ao salvar no GitHub:", error),
    )

    return NextResponse.json(noticias[index])
  } catch (error) {
    console.error(`Erro ao atualizar notícia ${params.id}:`, error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const noticias = readNoticias()

    const index = noticias.findIndex((n: any) => n.id === id)

    if (index === -1) {
      return NextResponse.json({ error: "Notícia não encontrada" }, { status: 404 })
    }

    // Remover notícia
    noticias.splice(index, 1)

    // Salvar arquivo
    const saved = saveNoticias(noticias)

    if (!saved) {
      return NextResponse.json({ error: "Erro ao excluir notícia" }, { status: 500 })
    }

    // Tentar salvar no GitHub, mas não falhar se não conseguir
    saveFileToGitHub(JSON.stringify(noticias, null, 2)).catch((error) =>
      console.error("Erro ao salvar no GitHub:", error),
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Erro ao excluir notícia ${params.id}:`, error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
