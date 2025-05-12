import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const deployId = searchParams.get("deployId")

    // Se um deployId específico for fornecido, buscar informações desse deploy
    if (deployId) {
      return await getDeployStatus(deployId)
    }

    // Caso contrário, buscar os deploys mais recentes
    return await getRecentDeploys()
  } catch (error: any) {
    console.error("Erro ao verificar status do deploy na Vercel:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Erro desconhecido ao verificar status do deploy",
      },
      { status: 500 },
    )
  }
}

async function getDeployStatus(deployId: string) {
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

  // Construir a URL da API da Vercel
  let apiUrl = `https://api.vercel.com/v13/deployments/${deployId}`

  // Adicionar teamId se disponível
  if (teamId) {
    apiUrl += `?teamId=${teamId}`
  }

  // Fazer a requisição para a API da Vercel
  const response = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${vercelToken}`,
    },
  })

  if (!response.ok) {
    return NextResponse.json(
      {
        status: "error",
        message: `Erro ao buscar status do deploy: ${response.status} ${response.statusText}`,
      },
      { status: response.status },
    )
  }

  const deployData = await response.json()

  // Mapear o estado do deploy para um formato mais amigável
  const status = mapDeployState(deployData.state)

  return NextResponse.json({
    status: status.status,
    message: status.message,
    deploy: {
      id: deployData.id,
      url: deployData.url ? `https://${deployData.url}` : null,
      createdAt: deployData.createdAt,
      state: deployData.state,
      readyState: deployData.readyState,
      buildingAt: deployData.buildingAt,
      ready: deployData.ready,
      target: deployData.target,
      meta: deployData.meta,
    },
  })
}

// Modificar a função getRecentDeploys para melhorar o tratamento de erros e logging

async function getRecentDeploys() {
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
  // Modificação: Usar a versão 6 da API para equipes e a versão 13 para usuários individuais
  const apiUrl = teamId
    ? `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=5&teamId=${teamId}`
    : `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=5`

  console.log(`Buscando deploys recentes: ${apiUrl}`)

  try {
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
          message: `Erro ao buscar deploys recentes: Status ${response.status} - ${response.statusText}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    const data = await response.json()

    // Verificar se a resposta contém a propriedade deployments
    if (!data.deployments || !Array.isArray(data.deployments)) {
      console.error("Formato de resposta inesperado da API da Vercel:", data)
      return NextResponse.json(
        {
          status: "error",
          message: "Formato de resposta inesperado da API da Vercel",
          details: JSON.stringify(data),
        },
        { status: 500 },
      )
    }

    // Mapear os deploys para um formato mais amigável
    const deploys = data.deployments.map((deploy: any) => {
      const status = mapDeployState(deploy.state)

      return {
        id: deploy.id,
        url: deploy.url ? `https://${deploy.url}` : null,
        createdAt: deploy.createdAt,
        state: deploy.state,
        readyState: deploy.readyState,
        buildingAt: deploy.buildingAt,
        ready: deploy.ready,
        target: deploy.target,
        meta: deploy.meta,
        status: status.status,
        message: status.message,
      }
    })

    return NextResponse.json({
      deploys,
    })
  } catch (error: any) {
    console.error("Erro ao buscar deploys recentes:", error)
    return NextResponse.json(
      {
        status: "error",
        message: `Erro ao buscar deploys recentes: ${error.message || "Erro desconhecido"}`,
      },
      { status: 500 },
    )
  }
}

// Função para mapear o estado do deploy para um formato mais amigável
function mapDeployState(state: string) {
  switch (state) {
    case "BUILDING":
      return { status: "pending", message: "Deploy em construção..." }
    case "ERROR":
      return { status: "error", message: "Erro durante o deploy" }
    case "READY":
      return { status: "success", message: "Deploy concluído com sucesso" }
    case "CANCELED":
      return { status: "error", message: "Deploy cancelado" }
    case "QUEUED":
      return { status: "pending", message: "Deploy na fila..." }
    default:
      return { status: "pending", message: `Estado do deploy: ${state}` }
  }
}
