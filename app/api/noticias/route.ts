import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

// Caminho do arquivo de notícias
const noticiasFilePath = path.join(process.cwd(), "data", "noticias.json")

// Função para ler notícias
function readNoticias() {
  if (!fs.existsSync(noticiasFilePath)) {
    return []
  }

  try {
    const data = fs.readFileSync(noticiasFilePath, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error("Erro ao ler arquivo de notícias:", error)
    return []
  }
}

export async function GET() {
  try {
    const noticias = readNoticias()

    // Ordenar por data (mais recente primeiro)
    noticias.sort((a: any, b: any) => {
      return new Date(b.data).getTime() - new Date(a.data).getTime()
    })

    return NextResponse.json(noticias)
  } catch (error) {
    console.error("Erro ao buscar notícias:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
