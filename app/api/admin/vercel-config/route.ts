import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  // Obter configuração dos cookies ou variáveis de ambiente
  const cookieStore = cookies()

  const config = {
    teamId: cookieStore.get("vercel_team_id")?.value || process.env.VERCEL_TEAM_ID || "",
    projectId: cookieStore.get("vercel_project_id")?.value || process.env.VERCEL_PROJECT_ID || "",
  }

  return NextResponse.json(config)
}

export async function POST(request: Request) {
  try {
    const { token, teamId, projectId } = await request.json()

    if (!token || !projectId) {
      return NextResponse.json({ error: "Token e ID do projeto são obrigatórios" }, { status: 400 })
    }

    // Testar a configuração antes de salvar
    try {
      console.log(`Testando acesso à API da Vercel para o projeto: ${projectId}`)

      // Construir a URL da API da Vercel
      let apiUrl = `https://api.vercel.com/v9/projects/${projectId}`

      // Adicionar teamId se disponível
      if (teamId) {
        apiUrl += `?teamId=${teamId}`
      }

      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        let errorMessage = "Não foi possível acessar o projeto na Vercel."

        if (response.status === 401) {
          errorMessage = "Token inválido ou expirado. Verifique se o token está correto."
        } else if (response.status === 403) {
          errorMessage = "Permissão negada. Verifique se o token tem as permissões necessárias."
        } else if (response.status === 404) {
          errorMessage = `Projeto não encontrado: ${projectId}. Verifique se o ID do projeto está correto.`
        }

        console.error(`Erro ao acessar projeto na Vercel: ${errorMessage}`)
        return NextResponse.json({ error: errorMessage }, { status: 400 })
      }

      console.log("Configuração da Vercel validada com sucesso!")
    } catch (error: any) {
      console.error("Erro ao testar configuração da Vercel:", error)
      return NextResponse.json(
        {
          error: `Erro ao testar a configuração: ${error.message || "Erro desconhecido"}. Verifique as credenciais.`,
        },
        { status: 400 },
      )
    }

    // Salvar configuração em cookies
    const cookieStore = cookies()

    cookieStore.set("vercel_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 dias
      path: "/",
    })

    if (teamId) {
      cookieStore.set("vercel_team_id", teamId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30 dias
        path: "/",
      })
    }

    cookieStore.set("vercel_project_id", projectId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 dias
      path: "/",
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Erro ao salvar configuração:", error)
    return NextResponse.json(
      { error: `Erro interno do servidor: ${error.message || "Erro desconhecido"}` },
      { status: 500 },
    )
  }
}
