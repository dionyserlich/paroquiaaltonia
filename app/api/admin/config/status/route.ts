import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { isGithubConfigured } from "../../config"

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
    configured: isGithubConfigured(config),
  })
}
