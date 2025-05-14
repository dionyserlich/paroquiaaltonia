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

    const fileContents = await fs.readFile(filePath, "utf8")
    let noticias = []

    try {
      noticias = JSON.parse(fileContents)
    } catch (e) {
      console.error(`Erro ao parsear JSON de notícias: ${e}`)
      // Se o arquivo estiver corrompido, criar um novo
      await fs.writeFile(filePath, JSON.stringify([]), "utf8")
      return NextResponse.json([], { status: 200 })
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
