import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    // Ler arquivo existente
    const filePath = path.join(process.cwd(), "data", "proximosEventos.json")
    const fileData = await fs.readFile(filePath, "utf8")
    const eventos = JSON.parse(fileData)

    // Encontrar evento pelo ID
    const evento = eventos.find((e: any) => e.id === id)

    if (!evento) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 })
    }

    return NextResponse.json(evento)
  } catch (error) {
    console.error("Erro ao buscar evento:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
