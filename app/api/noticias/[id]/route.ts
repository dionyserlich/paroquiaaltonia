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
