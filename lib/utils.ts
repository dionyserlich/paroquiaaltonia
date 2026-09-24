import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatarData(dataString: string) {
  try {
    const data = new Date(dataString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      // Fuso fixo: sem ele o Intl usa o do ambiente, e o servidor da Vercel
      // roda em UTC. O HTML saía com o horário em UTC (uma missa das 19h
      // aparecia como 22h), o navegador corrigia depois da hidratação — o que
      // além de mostrar a hora errada até lá, e para o Google que indexa o
      // HTML, disparava divergência de hidratação (erro React #418).
      timeZone: "America/Sao_Paulo",
    }).format(data)
  } catch (error) {
    console.error("Erro ao formatar data:", error)
    return dataString
  }
}
