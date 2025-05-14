import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const filePath = path.join(process.cwd(), "data", "ultimasNoticias.json")

    // Verificar se o arquivo existe
    try {
      await fs.access(filePath)
    } catch (error) {
      console.error(`Arquivo ultimasNoticias.json não encontrado: ${error}`)
      return NextResponse.json({ error: "Notícia não encontrada" }, { status: 404 })
    }

    const fileContents = await fs.readFile(filePath, "utf8")
    let noticias = []

    try {
      noticias = JSON.parse(fileContents)
    } catch (e) {
      console.error(`Erro ao parsear JSON de notícias: ${e}`)
      return NextResponse.json({ error: "Erro ao ler arquivo de notícias" }, { status: 500 })
    }

    // Melhorar a comparação de IDs convertendo ambos para string
    const noticia = noticias.find((n: any) => String(n.id) === String(id))

    if (!noticia) {
      console.error(
        `Notícia com ID ${id} não encontrada. IDs disponíveis: ${noticias.map((n: any) => n.id).join(", ")}`,
      )
      return NextResponse.json({ error: "Notícia não encontrada" }, { status: 404 })
    }

    return NextResponse.json(noticia, { status: 200 })
  } catch (error) {
    console.error(`Erro ao buscar notícia ${params.id}: ${error}`)
    return NextResponse.json({ error: "Erro ao buscar notícia" }, { status: 500 })
  }
}
