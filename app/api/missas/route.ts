import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "missas.json")
    const fileData = await fs.readFile(filePath, "utf8")
    const missas = JSON.parse(fileData)

    // Ordenar por data de início (mais recente primeiro)
    missas.sort((a: any, b: any) => new Date(b.inicio).getTime() - new Date(a.inicio).getTime())

    return NextResponse.json(missas)
  } catch (error) {
    console.error("Erro ao ler missas.json:", error)
    return NextResponse.json([], { status: 500 })
  }
}
