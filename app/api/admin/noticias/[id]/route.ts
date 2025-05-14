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
  fs.writeFileSync(filePath, JSON.stringify(noticias, null, 2))
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const noticias = readNoticiasFile()

    const noticia = noticias.find((n: any) => n.id === id)

    if (!noticia) {
      return NextResponse.json({ error: "Notícia não encontrada" }, { status: 404 })
    }

    return NextResponse.json(noticia, { status: 200 })
  } catch (error) {
    console.error(`Erro ao buscar notícia ${params.id}:`, error)
    return NextResponse.json({ error: "Erro ao buscar notícia" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const data = await request.json()

    // Validar dados
    if (!data.titulo || !data.resumo || !data.conteudo) {
      return NextResponse.json({ error: "Título, resumo e conteúdo são obrigatórios" }, { status: 400 })
    }

    const noticias = readNoticiasFile()

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

    // Salvar arquivo
    saveNoticiasFile(noticias)

    return NextResponse.json(noticias[index], { status: 200 })
  } catch (error) {
    console.error(`Erro ao atualizar notícia ${params.id}:`, error)
    return NextResponse.json({ error: "Erro ao atualizar notícia" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const noticias = readNoticiasFile()

    const index = noticias.findIndex((n: any) => n.id === id)

    if (index === -1) {
      return NextResponse.json({ error: "Notícia não encontrada" }, { status: 404 })
    }

    // Remover notícia
    noticias.splice(index, 1)

    // Salvar arquivo
    saveNoticiasFile(noticias)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error(`Erro ao excluir notícia ${params.id}:`, error)
    return NextResponse.json({ error: "Erro ao excluir notícia" }, { status: 500 })
  }
}
