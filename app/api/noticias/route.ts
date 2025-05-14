import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "noticias.json")

    if (!fs.existsSync(filePath)) {
      return NextResponse.json([])
    }

    const fileContents = fs.readFileSync(filePath, "utf8")
    const noticias = JSON.parse(fileContents)

    // Ordenar por data (mais recente primeiro)
    noticias.sort((a: any, b: any) => new Date(b.data).getTime() - new Date(a.data).getTime())

    return NextResponse.json(noticias)
  } catch (error) {
    console.error("Erro ao buscar notícias:", error)
    return NextResponse.json([], { status: 500 })
  }
}
