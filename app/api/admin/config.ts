// Configurações para a API do GitHub
export function getGithubConfig() {
  // Valores padrão ou do ambiente
  return {
    owner: process.env.GITHUB_OWNER || "seu-usuario-github",
    repo: process.env.GITHUB_REPO || "paroquia-sao-sebastiao",
    branch: process.env.GITHUB_BRANCH || "main",
    token: process.env.GITHUB_TOKEN || "",
  }
}

// Função para verificar se a configuração do GitHub está completa
export function isGithubConfigured(config: ReturnType<typeof getGithubConfig>) {
  return config.owner !== "seu-usuario-github" && config.repo !== "paroquia-sao-sebastiao" && config.token !== ""
}
