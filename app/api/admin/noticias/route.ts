import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "ultimasNoticias.json")

    // Verificar se o arquivo existe
    try {
      await fs.access(filePath)
    } catch (error) {
      console.error(`Arquivo ultimasNoticias.json não encontrado: ${error}`)
      // Se o arquivo não existir, criar um novo com array vazio
      await fs.mkdir(path.dirname(filePath), { recursive: true })
      await fs.writeFile(filePath, JSON.stringify([]), "utf8")
      return NextResponse.json([], { status: 200 })
    }

    const fileContents = await fs.readFile(filePath, "utf8")
    let noticias = []

    try {
      noticias = JSON.parse(fileContents)
    } catch (e) {
      console.error(`Erro ao parsear JSON de notícias: ${e}`)
      // Se o arquivo estiver corrompido, criar um novo
      await fs.writeFile(filePath, JSON.stringify([]), "utf8")
      noticias = []
    }

    // Ordenar por data (mais recente primeiro)
    noticias.sort((a: any, b: any) => {
      return new Date(b.data).getTime() - new Date(a.data).getTime()
    })

    return NextResponse.json(noticias, { status: 200 })
  } catch (error) {
    console.error(`Erro ao buscar notícias: ${error}`)
    return NextResponse.json({ error: `Erro ao buscar notícias: ${error.message}` }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const filePath = path.join(process.cwd(), "data", "ultimasNoticias.json")

    // Validar dados
    if (!data.titulo || !data.resumo || !data.conteudo) {
      return NextResponse.json({ error: "Título, resumo e conteúdo são obrigatórios" }, { status: 400 })
    }

    // Verificar se o diretório existe e criar se não existir
    const dirPath = path.dirname(filePath)
    try {
      await fs.access(dirPath)
    } catch (error) {
      await fs.mkdir(dirPath, { recursive: true })
    }

    let noticias = []

    // Verificar se o arquivo existe e criar se não existir
    try {
      await fs.access(filePath)
      const fileContents = await fs.readFile(filePath, "utf8")
      try {
        noticias = JSON.parse(fileContents)
      } catch (e) {
        console.error(`Erro ao parsear JSON de notícias: ${e}`)
        // Se o arquivo estiver corrompido, criar um novo
        noticias = []
      }
    } catch (error) {
      // Arquivo não existe, criar um novo
      console.log("Arquivo de notícias não existe, criando novo arquivo")
    }

    // Criar nova notícia
    const novaNoticia = {
      id: uuidv4(),
      titulo: data.titulo,
      resumo: data.resumo,
      conteudo: data.conteudo,
      imagem: data.imagem || "/placeholder.svg?height=600&width=800",
      data: data.data || new Date().toISOString(),
      destaque: data.destaque || false,
    }

    // Adicionar à lista
    noticias.push(novaNoticia)

    // Salvar arquivo usando método mais seguro
    const tempFile = `${filePath}.temp`
    await fs.writeFile(tempFile, JSON.stringify(noticias, null, 2), "utf8")
    await fs.rename(tempFile, filePath)

    return NextResponse.json(novaNoticia, { status: 201 })
  } catch (error) {
    console.error(`Erro ao criar notícia: ${error}`)
    return NextResponse.json({ error: `Erro ao criar notícia: ${error.message}` }, { status: 500 })
  }
}
