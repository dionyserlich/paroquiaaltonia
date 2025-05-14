import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

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

    const fileData = await fs.readFile(filePath, "utf8")
    let noticias = []

    try {
      noticias = JSON.parse(fileData)
    } catch (error) {
      console.error(`Erro ao parsear JSON de notícias: ${error}`)
      // Se o arquivo estiver corrompido, criar um novo
      await fs.writeFile(filePath, JSON.stringify([]), "utf8")
      return NextResponse.json([], { status: 200 })
    }

    // Ordenar por data (mais recente primeiro)
    noticias.sort((a: any, b: any) => new Date(b.data).getTime() - new Date(a.data).getTime())

    // Limitar a 5 notícias
    const ultimasNoticias = noticias.slice(0, 5)

    return NextResponse.json(ultimasNoticias)
  } catch (error) {
    console.error(`Erro ao ler ultimasNoticias.json: ${error}`)
    return NextResponse.json([], { status: 500 })
  }
}
