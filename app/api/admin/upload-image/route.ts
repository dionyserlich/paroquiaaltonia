import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { isGithubConfigured } from "../config"

export async function POST(request: Request) {
  try {
    // Obter configuração dos cookies ou variáveis de ambiente
    const cookieStore = cookies()

    const config = {
      owner: cookieStore.get("github_owner")?.value || process.env.GITHUB_OWNER || "seu-usuario-github",
      repo: cookieStore.get("github_repo")?.value || process.env.GITHUB_REPO || "paroquia-sao-sebastiao",
      branch: cookieStore.get("github_branch")?.value || process.env.GITHUB_BRANCH || "main",
      token: cookieStore.get("github_token")?.value || process.env.GITHUB_TOKEN || "",
    }

    // Verificar se o GitHub está configurado
    if (!isGithubConfigured(config)) {
      return NextResponse.json(
        {
          error: "GitHub não configurado. Configure as variáveis de ambiente GITHUB_OWNER, GITHUB_REPO e GITHUB_TOKEN.",
        },
        { status: 500 },
      )
    }

    // Verificar se o token BLOB está configurado
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        {
          error: "Token do Vercel Blob não configurado. Configure a variável de ambiente BLOB_READ_WRITE_TOKEN.",
        },
        { status: 500 },
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    // Verificar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "O arquivo deve ser uma imagem" }, { status: 400 })
    }

    // Gerar nome de arquivo único
    const timestamp = Date.now()
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`

    // Fazer upload para o Vercel Blob
    const { put } = await import("@vercel/blob")
    const { url } = await put(fileName, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    return NextResponse.json({ url })
  } catch (error: any) {
    console.error("Erro ao fazer upload de imagem:", error)
    return NextResponse.json({ error: error.message || "Erro interno do servidor" }, { status: 500 })
  }
}
