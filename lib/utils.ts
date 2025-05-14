import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function formatarData(dataString: string): string {
  try {
    const data = new Date(dataString)
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch (error) {
    console.error("Erro ao formatar data:", error)
    return "Data inválida"
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
