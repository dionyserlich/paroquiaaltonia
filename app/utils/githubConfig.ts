import { cookies } from "next/headers"

/**
 * Retrieves GitHub configuration from cookies or environment variables
 */
export function getGithubConfig() {
  const cookieStore = cookies()

  return {
    owner: cookieStore.get("github_owner")?.value || process.env.GITHUB_OWNER || "seu-usuario-github",
    repo: cookieStore.get("github_repo")?.value || process.env.GITHUB_REPO || "paroquia-sao-sebastiao",
    branch: cookieStore.get("github_branch")?.value || process.env.GITHUB_BRANCH || "main",
    token: cookieStore.get("github_token")?.value || process.env.GITHUB_TOKEN || "",
  }
}

/**
 * Checks if GitHub is properly configured
 */
export function isGithubConfigured(config: ReturnType<typeof getGithubConfig>) {
  return config.owner !== "seu-usuario-github" && config.repo !== "paroquia-sao-sebastiao" && config.token !== ""
}
