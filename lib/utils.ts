import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function formatarData(dataString: string): string {
  try {
    const data = new Date(dataString)
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch (error) {
    console.error("Erro ao formatar data:", error)
    return dataString
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
