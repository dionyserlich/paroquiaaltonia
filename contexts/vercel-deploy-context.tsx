"use client"

import { createContext, useState, useContext, type ReactNode } from "react"

interface VercelDeployContextType {
  deployId: string | null
  setDeployId: (id: string | null) => void
  clearDeployId: () => void
}

const VercelDeployContext = createContext<VercelDeployContextType | undefined>(undefined)

export function VercelDeployProvider({ children }: { children: ReactNode }) {
  const [deployId, setDeployId] = useState<string | null>(null)

  const clearDeployId = () => setDeployId(null)

  return (
    <VercelDeployContext.Provider value={{ deployId, setDeployId, clearDeployId }}>
      {children}
    </VercelDeployContext.Provider>
  )
}

export function useVercelDeploy() {
  const context = useContext(VercelDeployContext)
  if (context === undefined) {
    throw new Error("useVercelDeploy must be used within a VercelDeployProvider")
  }
  return context
}
