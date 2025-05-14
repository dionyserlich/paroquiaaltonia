import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const filePath = path.join(process.cwd(), "data", "ultimasNoticias.json")

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Notícia não encontrada" }, { status: 404 })
    }

    const fileContents = fs.readFileSync(filePath, "utf8")
    let noticias = []

    try {
      noticias = JSON.parse(fileContents)
    } catch (e) {
      console.error("Erro ao parsear JSON de notícias:", e)
      return NextResponse.json({ error: "Erro ao ler arquivo de notícias" }, { status: 500 })
    }

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
    const filePath = path.join(process.cwd(), "data", "ultimasNoticias.json")

    // Validar dados
    if (!data.titulo || !data.resumo || !data.conteudo) {
      return NextResponse.json({ error: "Título, resumo e conteúdo são obrigatórios" }, { status: 400 })
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Notícia não encontrada" }, { status: 404 })
    }

    const fileContents = fs.readFileSync(filePath, "utf8")
    let noticias = []

    try {
      noticias = JSON.parse(fileContents)
    } catch (e) {
      console.error("Erro ao parsear JSON de notícias:", e)
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

    // Salvar arquivo
    fs.writeFileSync(filePath, JSON.stringify(noticias, null, 2))

    return NextResponse.json(noticias[index], { status: 200 })
  } catch (error) {
    console.error(`Erro ao atualizar notícia ${params.id}:`, error)
    return NextResponse.json({ error: "Erro ao atualizar notícia" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const filePath = path.join(process.cwd(), "data", "ultimasNoticias.json")

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Notícia não encontrada" }, { status: 404 })
    }

    const fileContents = fs.readFileSync(filePath, "utf8")
    let noticias = []

    try {
      noticias = JSON.parse(fileContents)
    } catch (e) {
      console.error("Erro ao parsear JSON de notícias:", e)
      return NextResponse.json({ error: "Erro ao ler arquivo de notícias" }, { status: 500 })
    }

    const index = noticias.findIndex((n: any) => n.id === id)

    if (index === -1) {
      return NextResponse.json({ error: "Notícia não encontrada" }, { status: 404 })
    }

    // Remover notícia
    noticias.splice(index, 1)

    // Salvar arquivo
    fs.writeFileSync(filePath, JSON.stringify(noticias, null, 2))

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error(`Erro ao excluir notícia ${params.id}:`, error)
    return NextResponse.json({ error: "Erro ao excluir notícia" }, { status: 500 })
  }
}
