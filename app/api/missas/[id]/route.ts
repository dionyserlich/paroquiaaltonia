import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    // Ler arquivo existente
    const filePath = path.join(process.cwd(), "data", "missas.json")
    const fileData = await fs.readFile(filePath, "utf8")
    const missas = JSON.parse(fileData)

    // Encontrar missa pelo ID
    const missa = missas.find((m: any) => m.id === id)

    if (!missa) {
      return NextResponse.json({ error: "Missa não encontrada" }, { status: 404 })
    }

    return NextResponse.json(missa)
  } catch (error) {
    console.error("Erro ao buscar missa:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
