import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// Obter configuração atual
export async function GET() {
  // Obter configuração dos cookies ou variáveis de ambiente
  const cookieStore = cookies()

  const config = {
    owner: cookieStore.get("github_owner")?.value || process.env.GITHUB_OWNER || "seu-usuario-github",
    repo: cookieStore.get("github_repo")?.value || process.env.GITHUB_REPO || "paroquia-sao-sebastiao",
    branch: cookieStore.get("github_branch")?.value || process.env.GITHUB_BRANCH || "main",
    token: cookieStore.get("github_token")?.value || process.env.GITHUB_TOKEN || "",
  }

  return NextResponse.json({
    owner: config.owner === "seu-usuario-github" ? "" : config.owner,
    repo: config.repo === "paroquia-sao-sebastiao" ? "" : config.repo,
    branch: config.branch,
  })
}

// Salvar configuração
export async function POST(request: Request) {
  try {
    const { owner, repo, branch, token } = await request.json()

    if (!owner || !repo || !branch || !token) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    // Testar a configuração antes de salvar
    try {
      console.log(`Testando acesso ao repositório: ${owner}/${repo} (branch: ${branch})`)

      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents?ref=${branch}`, {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      })

      const responseData = await response.text()
      console.log(`Resposta da API do GitHub: Status ${response.status}`)

      if (!response.ok) {
        let errorMessage = "Não foi possível acessar o repositório."

        if (response.status === 401) {
          errorMessage = "Token inválido ou expirado. Verifique se o token está correto."
        } else if (response.status === 403) {
          errorMessage = "Permissão negada. Verifique se o token tem as permissões necessárias (escopo 'repo')."
        } else if (response.status === 404) {
          errorMessage = `Repositório não encontrado: ${owner}/${repo}. Verifique se o nome do usuário/organização e do repositório estão corretos.`
        } else if (response.status === 422) {
          errorMessage = `Branch '${branch}' não encontrada. Verifique se o nome da branch está correto.`
        }

        console.error(`Erro ao acessar repositório: ${errorMessage}`, responseData)
        return NextResponse.json({ error: errorMessage }, { status: 400 })
      }

      // Verificar se a pasta data existe
      const dataFolderResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/data?ref=${branch}`,
        {
          headers: {
            Authorization: `token ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
        },
      )

      if (!dataFolderResponse.ok) {
        console.error(`Pasta 'data' não encontrada no repositório. Status: ${dataFolderResponse.status}`)
        return NextResponse.json(
          {
            error:
              "A pasta 'data' não foi encontrada no repositório. Verifique se a estrutura do repositório está correta.",
          },
          { status: 400 },
        )
      }

      // Verificar permissões de escrita
      const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      })

      if (!userResponse.ok) {
        console.error(`Erro ao verificar usuário. Status: ${userResponse.status}`)
        return NextResponse.json(
          { error: "Não foi possível verificar o usuário do token. Verifique se o token está correto." },
          { status: 400 },
        )
      }

      const userData = await userResponse.json()
      console.log(`Token autenticado como usuário: ${userData.login}`)

      // Verificar permissões do repositório
      const repoPermissionsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      })

      if (!repoPermissionsResponse.ok) {
        console.error(`Erro ao verificar permissões do repositório. Status: ${repoPermissionsResponse.status}`)
        return NextResponse.json({ error: "Não foi possível verificar as permissões do repositório." }, { status: 400 })
      }

      const repoData = await repoPermissionsResponse.json()

      if (!repoData.permissions || !repoData.permissions.push) {
        console.error("O token não tem permissões de escrita no repositório.")
        return NextResponse.json(
          {
            error:
              "O token não tem permissões de escrita no repositório. Verifique se o token tem o escopo 'repo' ou 'public_repo'.",
          },
          { status: 400 },
        )
      }

      console.log("Configuração do GitHub validada com sucesso!")
    } catch (error: any) {
      console.error("Erro ao testar configuração do GitHub:", error)
      return NextResponse.json(
        {
          error: `Erro ao testar a configuração: ${error.message || "Erro desconhecido"}. Verifique as credenciais e permissões.`,
        },
        { status: 400 },
      )
    }

    // Salvar configuração em cookies
    const cookieStore = cookies()

    cookieStore.set("github_owner", owner, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 dias
      path: "/",
    })

    cookieStore.set("github_repo", repo, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 dias
      path: "/",
    })

    cookieStore.set("github_branch", branch, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 dias
      path: "/",
    })

    cookieStore.set("github_token", token, {
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
