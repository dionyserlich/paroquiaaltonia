import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "ultimasNoticias.json")
    const fileData = await fs.readFile(filePath, "utf8")
    const noticias = JSON.parse(fileData)

    // Ordenar por data (mais recente primeiro)
    noticias.sort((a: any, b: any) => new Date(b.data).getTime() - new Date(a.data).getTime())

    // Limitar a 5 notícias
    const ultimasNoticias = noticias.slice(0, 5)

    return NextResponse.json(ultimasNoticias)
  } catch (error) {
    console.error("Erro ao ler ultimasNoticias.json:", error)
    return NextResponse.json([], { status: 500 })
  }
}
