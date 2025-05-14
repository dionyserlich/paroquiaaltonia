import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "ultimasNoticias.json")

    // Se o arquivo não existir, criar um arquivo vazio
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([]), "utf8")
      return NextResponse.json([], { status: 200 })
    }

    const fileContents = fs.readFileSync(filePath, "utf8")
    let noticias = []

    try {
      noticias = JSON.parse(fileContents)
    } catch (e) {
      console.error("Erro ao parsear JSON de notícias:", e)
      // Se o arquivo estiver corrompido, criar um novo
      fs.writeFileSync(filePath, JSON.stringify([]), "utf8")
    }

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
    const filePath = path.join(process.cwd(), "data", "ultimasNoticias.json")

    // Validar dados
    if (!data.titulo || !data.resumo || !data.conteudo) {
      return NextResponse.json({ error: "Título, resumo e conteúdo são obrigatórios" }, { status: 400 })
    }

    let noticias = []

    // Verificar se o arquivo existe e criar se não existir
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true })
    }

    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, "utf8")
      try {
        noticias = JSON.parse(fileContents)
      } catch (e) {
        console.error("Erro ao parsear JSON de notícias:", e)
        // Se o arquivo estiver corrompido, criar um novo
        noticias = []
      }
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

    // Salvar arquivo
    fs.writeFileSync(filePath, JSON.stringify(noticias, null, 2))

    return NextResponse.json(novaNoticia, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar notícia:", error)
    return NextResponse.json({ error: "Erro ao criar notícia" }, { status: 500 })
  }
}
