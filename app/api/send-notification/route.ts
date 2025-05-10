import { NextResponse } from "next/server"
import { sendNotificationToAll } from "@/app/actions"

export async function POST(request: Request) {
  try {
    const { title, body, url } = await request.json()

    if (!title || !body) {
      return NextResponse.json({ error: "Título e corpo da notificação são obrigatórios" }, { status: 400 })
    }

    const result = await sendNotificationToAll(title, body, url)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Erro ao enviar notificação:", error)
    return NextResponse.json({ error: "Falha ao processar a solicitação" }, { status: 500 })
  }
}
