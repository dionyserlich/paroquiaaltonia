import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const filePath = path.join(process.cwd(), "data", "ultimasNoticias.json")

    // Verificar se o arquivo existe
    try {
      await fs.access(filePath)
    } catch (error) {
      console.error(`Arquivo ultimasNoticias.json não encontrado: ${error}`)
      return NextResponse.json({ error: "Notícia não encontrada" }, { status: 404 })
    }

    const fileContents = await fs.readFile(filePath, "utf8")
    let noticias = []

    try {
      noticias = JSON.parse(fileContents)
    } catch (e) {
      console.error(`Erro ao parsear JSON de notícias: ${e}`)
      return NextResponse.json({ error: "Erro ao ler arquivo de notícias" }, { status: 500 })
    }

    // Melhorar a comparação de IDs convertendo ambos para string
    const noticia = noticias.find((n: any) => String(n.id) === String(id))

    if (!noticia) {
      return NextResponse.json({ error: "Notícia não encontrada" }, { status: 404 })
    }

    return NextResponse.json(noticia, { status: 200 })
  } catch (error) {
    console.error(`Erro ao buscar notícia ${params.id}: ${error}`)
    return NextResponse.json({ error: `Erro ao buscar notícia: ${error.message}` }, { status: 500 })
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

    // Verificar se o arquivo existe
    try {
      await fs.access(filePath)
    } catch (error) {
      console.error(`Arquivo ultimasNoticias.json não encontrado: ${error}`)
      return NextResponse.json({ error: "Notícia não encontrada" }, { status: 404 })
    }

    const fileContents = await fs.readFile(filePath, "utf8")
    let noticias = []

    try {
      noticias = JSON.parse(fileContents)
    } catch (e) {
      console.error(`Erro ao parsear JSON de notícias: ${e}`)
      return NextResponse.json({ error: "Erro ao ler arquivo de notícias" }, { status: 500 })
    }

    // Melhorar a comparação de IDs convertendo ambos para string
    const index = noticias.findIndex((n: any) => String(n.id) === String(id))

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

    // Salvar arquivo usando método mais seguro
    const tempFile = `${filePath}.temp`
    await fs.writeFile(tempFile, JSON.stringify(noticias, null, 2), "utf8")
    await fs.rename(tempFile, filePath)

    return NextResponse.json(noticias[index], { status: 200 })
  } catch (error) {
    console.error(`Erro ao atualizar notícia ${params.id}: ${error}`)
    return NextResponse.json({ error: `Erro ao atualizar notícia: ${error.message}` }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const filePath = path.join(process.cwd(), "data", "ultimasNoticias.json")

    // Verificar se o arquivo existe
    try {
      await fs.access(filePath)
    } catch (error) {
      console.error(`Arquivo ultimasNoticias.json não encontrado: ${error}`)
      return NextResponse.json({ error: "Notícia não encontrada" }, { status: 404 })
    }

    const fileContents = await fs.readFile(filePath, "utf8")
    let noticias = []

    try {
      noticias = JSON.parse(fileContents)
    } catch (e) {
      console.error(`Erro ao parsear JSON de notícias: ${e}`)
      return NextResponse.json({ error: "Erro ao ler arquivo de notícias" }, { status: 500 })
    }

    // Melhorar a comparação de IDs convertendo ambos para string
    const index = noticias.findIndex((n: any) => String(n.id) === String(id))

    if (index === -1) {
      return NextResponse.json({ error: "Notícia não encontrada" }, { status: 404 })
    }

    // Remover notícia
    noticias.splice(index, 1)

    // Salvar arquivo usando método mais seguro
    const tempFile = `${filePath}.temp`
    await fs.writeFile(tempFile, JSON.stringify(noticias, null, 2), "utf8")
    await fs.rename(tempFile, filePath)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error(`Erro ao excluir notícia ${params.id}: ${error}`)
    return NextResponse.json({ error: `Erro ao excluir notícia: ${error.message}` }, { status: 500 })
  }
}
