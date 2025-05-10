import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    // Obter configuração dos cookies ou variáveis de ambiente
    const cookieStore = cookies()

    const config = {
      owner: cookieStore.get("github_owner")?.value || process.env.GITHUB_OWNER || "seu-usuario-github",
      repo: cookieStore.get("github_repo")?.value || process.env.GITHUB_REPO || "paroquia-sao-sebastiao",
      branch: cookieStore.get("github_branch")?.value || process.env.GITHUB_BRANCH || "main",
      token: cookieStore.get("github_token")?.value || process.env.GITHUB_TOKEN || "",
    }

    // Não exibir o token completo por segurança
    const maskedToken = config.token
      ? `${config.token.substring(0, 4)}...${config.token.substring(config.token.length - 4)}`
      : "não definido"

    const diagnostico = {
      configuracao: {
        owner: config.owner,
        repo: config.repo,
        branch: config.branch,
        token: maskedToken,
        isConfigured:
          config.owner !== "seu-usuario-github" && config.repo !== "paroquia-sao-sebastiao" && config.token !== "",
      },
      testes: {} as Record<string, any>,
    }

    // Testar acesso ao repositório
    if (config.token) {
      try {
        const repoResponse = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}`, {
          headers: {
            Authorization: `token ${config.token}`,
            Accept: "application/vnd.github.v3+json",
          },
        })

        const repoData = await repoResponse.json()

        diagnostico.testes.repositorio = {
          status: repoResponse.status,
          ok: repoResponse.ok,
          message: repoResponse.ok ? "Repositório acessível" : "Não foi possível acessar o repositório",
          details: repoResponse.ok
            ? {
                name: repoData.name,
                full_name: repoData.full_name,
                private: repoData.private,
                permissions: repoData.permissions,
              }
            : repoData,
        }

        // Testar acesso à pasta data
        if (repoResponse.ok) {
          const dataFolderResponse = await fetch(
            `https://api.github.com/repos/${config.owner}/${config.repo}/contents/data?ref=${config.branch}`,
            {
              headers: {
                Authorization: `token ${config.token}`,
                Accept: "application/vnd.github.v3+json",
              },
            },
          )

          diagnostico.testes.pastaData = {
            status: dataFolderResponse.status,
            ok: dataFolderResponse.ok,
            message: dataFolderResponse.ok ? "Pasta 'data' acessível" : "Não foi possível acessar a pasta 'data'",
          }

          // Testar acesso ao arquivo missas.json
          const missasResponse = await fetch(
            `https://api.github.com/repos/${config.owner}/${config.repo}/contents/data/missas.json?ref=${config.branch}`,
            {
              headers: {
                Authorization: `token ${config.token}`,
                Accept: "application/vnd.github.v3+json",
              },
            },
          )

          diagnostico.testes.arquivoMissas = {
            status: missasResponse.status,
            ok: missasResponse.ok,
            message: missasResponse.ok
              ? "Arquivo 'missas.json' acessível"
              : "Não foi possível acessar o arquivo 'missas.json'",
          }
        }

        // Testar usuário autenticado
        const userResponse = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `token ${config.token}`,
            Accept: "application/vnd.github.v3+json",
          },
        })

        const userData = await userResponse.json()

        diagnostico.testes.usuario = {
          status: userResponse.status,
          ok: userResponse.ok,
          message: userResponse.ok ? `Autenticado como ${userData.login}` : "Não foi possível autenticar o usuário",
          details: userResponse.ok
            ? {
                login: userData.login,
                name: userData.name,
                type: userData.type,
              }
            : userData,
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
