import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const filePath = path.join(process.cwd(), "data", "noticias.json")

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(null, { status: 404 })
    }

    const fileContents = fs.readFileSync(filePath, "utf8")
    const noticias = JSON.parse(fileContents)

    const noticia = noticias.find((n: any) => n.id === id)

    if (!noticia) {
      return NextResponse.json(null, { status: 404 })
    }

    return NextResponse.json(noticia)
  } catch (error) {
    console.error(`Erro ao buscar notícia ${params.id}:`, error)
    return NextResponse.json(null, { status: 500 })
  }
}
