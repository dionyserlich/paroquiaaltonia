import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "ultimasNoticias.json")

    if (!fs.existsSync(filePath)) {
      return NextResponse.json([])
    }

    const fileContent = fs.readFileSync(filePath, "utf8")
    const noticias = JSON.parse(fileContent)

    return NextResponse.json(noticias)
  } catch (error) {
    console.error("Erro ao obter notícias:", error)
    return NextResponse.json({ error: "Erro ao obter notícias" }, { status: 500 })
  }
}
