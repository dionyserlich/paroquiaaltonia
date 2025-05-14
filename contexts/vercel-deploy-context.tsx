"use client"

import { createContext, useState, useContext, type ReactNode, useEffect } from "react"

interface VercelDeployContextType {
  deployId: string | null
  setDeployId: (id: string | null) => void
  clearDeployId: () => void
}

const VercelDeployContext = createContext<VercelDeployContextType | undefined>(undefined)

export function VercelDeployProvider({ children }: { children: ReactNode }) {
  const [deployId, setDeployId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Garantir que o componente só seja renderizado no cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  const clearDeployId = () => setDeployId(null)

  if (!mounted) {
    // Retornar um placeholder durante a renderização do servidor
    return <>{children}</>
  }

  return (
    <VercelDeployContext.Provider value={{ deployId, setDeployId, clearDeployId }}>
      {children}
    </VercelDeployContext.Provider>
  )
}

export function useVercelDeploy() {
  const context = useContext(VercelDeployContext)

  if (context === undefined) {
    // Em vez de lançar um erro, retornar um contexto padrão
    // Isso evita erros durante a pré-renderização
    return {
      deployId: null,
      setDeployId: () => {},
      clearDeployId: () => {},
    }
  }

  return context
}
