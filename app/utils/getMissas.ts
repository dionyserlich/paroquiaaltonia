/**
 * Fetches the list of masses from the API.
 */
export async function getMissas() {
  try {
    const response = await fetch("/api/missas", {
      next: { revalidate: 0 },
      cache: "no-store",
    })
    if (!response.ok) throw new Error(`Erro ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error("Erro ao buscar missas:", error)
    return []
  }
}
