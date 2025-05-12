import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    // Obter configuração dos cookies ou variáveis de ambiente
    const cookieStore = cookies()

    const config = {
      token: cookieStore.get("vercel_token")?.value || process.env.VERCEL_TOKEN || "",
      teamId: cookieStore.get("vercel_team_id")?.value || process.env.VERCEL_TEAM_ID || "",
      projectId: cookieStore.get("vercel_project_id")?.value || process.env.VERCEL_PROJECT_ID || "",
    }

    // Não exibir o token completo por segurança
    const maskedToken = config.token
      ? `${config.token.substring(0, 4)}...${config.token.substring(config.token.length - 4)}`
      : "não definido"

    const diagnostico = {
      configuracao: {
        token: maskedToken,
        teamId: config.teamId || "não definido",
        projectId: config.projectId || "não definido",
        isConfigured: !!config.token && !!config.projectId,
      },
      testes: {} as Record<string, any>,
    }

    // Testar acesso à API da Vercel
    if (config.token) {
      try {
        // Testar acesso ao usuário
        const userResponse = await fetch("https://api.vercel.com/v2/user", {
          headers: {
            Authorization: `Bearer ${config.token}`,
          },
        })

        const userStatus = userResponse.status
        let userData = null

        try {
          userData = await userResponse.json()
        } catch (e) {
          console.error("Erro ao parsear resposta do usuário:", e)
        }

        diagnostico.testes.usuario = {
          status: userStatus,
          ok: userResponse.ok,
          message: userResponse.ok ? "Usuário autenticado com sucesso" : `Falha na autenticação: ${userStatus}`,
          data: userData,
        }

        // Se o usuário estiver autenticado, testar acesso ao projeto
        if (userResponse.ok && config.projectId) {
          // Construir URL da API
          let projectUrl = `https://api.vercel.com/v9/projects/${config.projectId}`

          if (config.teamId) {
            projectUrl += `?teamId=${config.teamId}`
          }

          const projectResponse = await fetch(projectUrl, {
            headers: {
              Authorization: `Bearer ${config.token}`,
            },
          })

          const projectStatus = projectResponse.status
          let projectData = null

          try {
            projectData = await projectResponse.json()
          } catch (e) {
            console.error("Erro ao parsear resposta do projeto:", e)
          }

          diagnostico.testes.projeto = {
            status: projectStatus,
            ok: projectResponse.ok,
            message: projectResponse.ok ? "Projeto acessado com sucesso" : `Falha ao acessar projeto: ${projectStatus}`,
            data: projectData,
          }

          // Testar acesso aos deploys
          let deploysUrl = `https://api.vercel.com/v6/deployments?projectId=${config.projectId}&limit=1`

          if (config.teamId) {
            deploysUrl += `&teamId=${config.teamId}`
          }

          const deploysResponse = await fetch(deploysUrl, {
            headers: {
              Authorization: `Bearer ${config.token}`,
            },
          })

          const deploysStatus = deploysResponse.status
          let deploysData = null

          try {
            deploysData = await deploysResponse.json()
          } catch (e) {
            console.error("Erro ao parsear resposta dos deploys:", e)
          }

          diagnostico.testes.deploys = {
            status: deploysStatus,
            ok: deploysResponse.ok,
            message: deploysResponse.ok
              ? "Deploys acessados com sucesso"
              : `Falha ao acessar deploys: ${deploysStatus}`,
            data: deploysData,
          }
        }
      } catch (error: any) {
        diagnostico.testes.erro = {
          message: error.message || "Erro desconhecido",
          stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        }
      }
    }

    return NextResponse.json(diagnostico)
  } catch (error: any) {
    return NextResponse.json(
      { error: `Erro ao executar diagnóstico: ${error.message || "Erro desconhecido"}` },
      { status: 500 },
    )
  }
}
