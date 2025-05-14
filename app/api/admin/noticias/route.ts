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

export async function GET() {
  try {
    const noticias = readNoticias()

    // Ordenar por data (mais recente primeiro)
    noticias.sort((a: any, b: any) => {
      return new Date(b.data).getTime() - new Date(a.data).getTime()
    })

    return NextResponse.json(noticias)
  } catch (error) {
    console.error("Erro ao buscar notícias:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validar dados
    if (!data.titulo || !data.conteudo) {
      return NextResponse.json({ error: "Título e conteúdo são obrigatórios" }, { status: 400 })
    }

    const noticias = readNoticias()

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
      conteudo: data.conteudo,
      imagem: data.imagem || "",
      data: data.data || new Date().toISOString(),
      destaque: data.destaque || false,
    }

    // Adicionar à lista
    noticias.push(novaNoticia)

    // Salvar arquivo
    const saved = saveNoticias(noticias)

    if (!saved) {
      return NextResponse.json({ error: "Erro ao salvar notícia" }, { status: 500 })
    }

    // Tentar salvar no GitHub, mas não falhar se não conseguir
    saveFileToGitHub(JSON.stringify(noticias, null, 2)).catch((error) =>
      console.error("Erro ao salvar no GitHub:", error),
    )

    return NextResponse.json(novaNoticia, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar notícia:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
