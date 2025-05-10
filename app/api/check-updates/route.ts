import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { sendNotificationToAll } from "@/app/actions"

// Armazenar os timestamps da última modificação
const lastModified: Record<string, number> = {}

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), "data")
    const files = ["missas.json", "banners.json", "proximosEventos.json", "ultimasNoticias.json"]

    const updates: string[] = []

    for (const file of files) {
      const filePath = path.join(dataDir, file)
      const stats = await fs.stat(filePath)
      const modTime = stats.mtimeMs

      // Se é a primeira verificação, apenas armazenar o timestamp
      if (lastModified[file] === undefined) {
        lastModified[file] = modTime
        continue
      }

      // Verificar se o arquivo foi modificado
      if (modTime > lastModified[file]) {
        updates.push(file)
        lastModified[file] = modTime
      }
    }

    // Enviar notificações para arquivos atualizados
    if (updates.length > 0) {
      const title = "Novidades na Paróquia São Sebastião"
      let body = ""
      let url = "/"

      if (updates.includes("missas.json")) {
        body = "Nova missa disponível!"
        url = "/"
      } else if (updates.includes("proximosEventos.json")) {
        body = "Novos eventos foram adicionados ao calendário!"
        url = "/eventos"
      } else if (updates.includes("ultimasNoticias.json")) {
        body = "Novas notícias da paróquia disponíveis!"
        url = "/noticias"
      } else if (updates.includes("banners.json")) {
        body = "Confira as novidades da paróquia!"
        url = "/"
      }

      if (body) {
        await sendNotificationToAll(title, body, url)
      }
    }

    return NextResponse.json({ updates })
  } catch (error) {
    console.error("Erro ao verificar atualizações:", error)
    return NextResponse.json({ error: "Falha ao verificar atualizações" }, { status: 500 })
  }
}
