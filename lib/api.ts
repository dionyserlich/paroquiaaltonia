// Funções para buscar dados dos arquivos JSON

export async function getMissas() {
  try {
    const timestamp = new Date().getTime()
    const res = await fetch(`/api/missas?t=${timestamp}`, {
      next: { revalidate: 0 },
      cache: "no-store",
    })
    if (!res.ok) return []
    return res.json()
  } catch (error) {
    console.error("Erro ao buscar missas:", error)
    return []
  }
}

export async function getBanners() {
  try {
    const res = await fetch("/api/banners", {
      next: { revalidate: 3600 },
      cache: "no-store",
    })
    if (!res.ok) return []
    return res.json()
  } catch (error) {
    console.error("Erro ao buscar banners:", error)
    return []
  }
}

export async function getProximosEventos() {
  try {
    // Adicionar timestamp para evitar cache do navegador
    const timestamp = new Date().getTime()
    const res = await fetch(`/api/proximos-eventos?t=${timestamp}`, {
      next: { revalidate: 0 }, // Não usar cache
      cache: "no-store",
    })

    if (!res.ok) {
      console.error(`Erro ao buscar próximos eventos: ${res.status} ${res.statusText}`)
      return []
    }

    const data = await res.json()

    // Verificar se os dados são válidos
    if (!Array.isArray(data)) {
      console.error("Dados de eventos inválidos:", data)
      return []
    }

    return data
  } catch (error) {
    console.error("Erro ao buscar próximos eventos:", error)
    return []
  }
}

export async function getUltimasNoticias() {
  try {
    const res = await fetch("/api/ultimas-noticias", {
      next: { revalidate: 3600 },
      cache: "no-store",
    })
    if (!res.ok) return []
    return res.json()
  } catch (error) {
    console.error("Erro ao buscar últimas notícias:", error)
    return []
  }
}

export async function getNoticias() {
  try {
    const timestamp = new Date().getTime()
    const res = await fetch(`/api/noticias?t=${timestamp}`, {
      next: { revalidate: 0 },
      cache: "no-store",
    })
    if (!res.ok) return []
    return res.json()
  } catch (error) {
    console.error("Erro ao buscar notícias:", error)
    return []
  }
}

export async function getNoticia(id: string) {
  try {
    const timestamp = new Date().getTime()
    const res = await fetch(`/api/noticias/${id}?t=${timestamp}`, {
      next: { revalidate: 0 },
      cache: "no-store",
    })
    if (!res.ok) return null
    return res.json()
  } catch (error) {
    console.error(`Erro ao buscar notícia ${id}:`, error)
    return null
  }
}
