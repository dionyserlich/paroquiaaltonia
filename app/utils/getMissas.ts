import { getGithubConfig } from "./githubConfig"

/**
 * Fetches the list of masses from GitHub or API
 */
export async function getMissas() {
  try {
    // First try to get from API
    const apiResponse = await fetch("/api/missas", {
      next: { revalidate: 0 },
      cache: "no-store",
    })

    if (apiResponse.ok) {
      return await apiResponse.json()
    }

    // If API fails, try to get directly from GitHub
    const config = getGithubConfig()

    if (!config.token || config.owner === "seu-usuario-github" || config.repo === "paroquia-sao-sebastiao") {
      throw new Error("GitHub não configurado corretamente")
    }

    const githubResponse = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/contents/data/missas.json?ref=${config.branch}`,
      {
        headers: {
          Authorization: `token ${config.token}`,
          Accept: "application/vnd.github.v3+json",
        },
      },
    )

    if (!githubResponse.ok) {
      throw new Error(`Erro ao buscar missas do GitHub: ${githubResponse.status}`)
    }

    const data = await githubResponse.json()
    const content = Buffer.from(data.content, "base64").toString("utf-8")
    return JSON.parse(content)
  } catch (error) {
    console.error("Erro ao buscar missas:", error)
    return []
  }
}
