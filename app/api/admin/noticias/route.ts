import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

// Função para ler o arquivo de notícias
function readNoticiasFile() {
  const filePath = path.join(process.cwd(), "data", "noticias.json")

  if (!fs.existsSync(filePath)) {
    return []
  }

  try {
    const fileContents = fs.readFileSync(filePath, "utf8")
    return JSON.parse(fileContents)
  } catch (error) {
    console.error("Erro ao ler arquivo de notícias:", error)
    return []
  }
}

// Função para salvar o arquivo de notícias
function saveNoticiasFile(noticias: any[]) {
  const filePath = path.join(process.cwd(), "data", "noticias.json")
  const dirPath = path.dirname(filePath)

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }

  fs.writeFileSync(filePath, JSON.stringify(noticias, null, 2))
}

export async function GET() {
  try {
    const noticias = readNoticiasFile()

    // Ordenar por data (mais recente primeiro)
    noticias.sort((a: any, b: any) => {
      return new Date(b.data).getTime() - new Date(a.data).getTime()
    })

    return NextResponse.json(noticias, { status: 200 })
  } catch (error) {
    console.error("Erro ao buscar notícias:", error)
    return NextResponse.json({ error: "Erro ao buscar notícias" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validar dados
    if (!data.titulo || !data.resumo || !data.conteudo) {
      return NextResponse.json({ error: "Título, resumo e conteúdo são obrigatórios" }, { status: 400 })
    }

    const noticias = readNoticiasFile()

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

    // Salvar arquivo
    saveNoticiasFile(noticias)

    return NextResponse.json(novaNoticia, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar notícia:", error)
    return NextResponse.json({ error: "Erro ao criar notícia" }, { status: 500 })
  }
}
