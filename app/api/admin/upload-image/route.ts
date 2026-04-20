import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        {
          error:
            "Token do Vercel Blob não configurado. Configure a variável de ambiente BLOB_READ_WRITE_TOKEN.",
        },
        { status: 500 },
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "O arquivo deve ser uma imagem" }, { status: 400 })
    }

    const timestamp = Date.now()
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`

    const { put } = await import("@vercel/blob")
    const { url } = await put(fileName, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    return NextResponse.json({ url })
  } catch (error: any) {
    console.error("Erro ao fazer upload de imagem:", error)
    return NextResponse.json(
      { error: error?.message || "Erro interno do servidor" },
      { status: 500 },
    )
  }
}
