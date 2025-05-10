import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "banners.json")
    const fileData = await fs.readFile(filePath, "utf8")
    const data = JSON.parse(fileData)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Erro ao ler banners.json:", error)
    return NextResponse.json([], { status: 500 })
  }
}
