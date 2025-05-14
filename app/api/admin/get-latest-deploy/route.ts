import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    // Obter token da Vercel dos cookies ou variáveis de ambiente
    const cookieStore = cookies()
    const vercelToken = cookieStore.get("vercel_token")?.value || process.env.VERCEL_TOKEN

    if (!vercelToken) {
      return NextResponse.json(
        {
          status: "error",
          message: "Token da Vercel não configurado",
        },
        { status: 500 },
      )
    }

    // Obter informações do projeto
    const teamId = cookieStore.get("vercel_team_id")?.value || process.env.VERCEL_TEAM_ID
    const projectId = cookieStore.get("vercel_project_id")?.value || process.env.VERCEL_PROJECT_ID

    if (!projectId) {
      return NextResponse.json(
        {
          status: "error",
          message: "ID do projeto da Vercel não configurado",
        },
        { status: 500 },
      )
    }

    // Construir a URL da API da Vercel
    const apiUrl = teamId
      ? `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=1&teamId=${teamId}`
      : `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=1`

    // Fazer a requisição para a API da Vercel
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Erro na API da Vercel: Status ${response.status}, Resposta: ${errorText}`)

      return NextResponse.json(
        {
          status: "error",
          message: `Erro ao buscar deploy mais recente: Status ${response.status} - ${response.statusText}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    const data = await response.json()

    // Verificar se a resposta contém a propriedade deployments
    if (!data.deployments || !Array.isArray(data.deployments) || data.deployments.length === 0) {
      return NextResponse.json(
        {
          status: "error",
          message: "Nenhum deploy encontrado",
        },
        { status: 404 },
      )
    }

    // Retornar o deploy mais recente
    const latestDeploy = data.deployments[0]

    return NextResponse.json({
      deployId: latestDeploy.id,
      createdAt: latestDeploy.createdAt,
      state: latestDeploy.state,
    })
  } catch (error: any) {
    console.error("Erro ao buscar deploy mais recente:", error)
    return NextResponse.json(
      {
        status: "error",
        message: `Erro ao buscar deploy mais recente: ${error.message || "Erro desconhecido"}`,
      },
      { status: 500 },
    )
  }
}
