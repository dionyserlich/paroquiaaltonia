import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "ultimasNoticias.json")

    // Se o arquivo não existir, retornar array vazio
    if (!fs.existsSync(filePath)) {
      return NextResponse.json([], { status: 200 })
    }

    const fileContents = fs.readFileSync(filePath, "utf8")
    let noticias = []

    try {
      noticias = JSON.parse(fileContents)
    } catch (e) {
      console.error("Erro ao parsear JSON de notícias:", e)
      return NextResponse.json([], { status: 200 })
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
