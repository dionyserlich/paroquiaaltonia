import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const filePath = path.join(process.cwd(), "data", "ultimasNoticias.json")

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Arquivo de notícias não encontrado" }, { status: 404 })
    }

    const fileContent = fs.readFileSync(filePath, "utf8")
    const noticias = JSON.parse(fileContent)

    const noticia = noticias.find((n: any) => n.id === id)

    if (!noticia) {
      return NextResponse.json({ error: "Notícia não encontrada" }, { status: 404 })
    }

    return NextResponse.json(noticia)
  } catch (error) {
    console.error("Erro ao obter notícia:", error)
    return NextResponse.json({ error: "Erro ao obter notícia" }, { status: 500 })
  }
}
