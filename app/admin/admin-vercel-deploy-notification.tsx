"use client"

import { useVercelDeploy } from "@/contexts/vercel-deploy-context"
import VercelDeployNotification from "@/components/vercel-deploy-notification"
import { useEffect, useState } from "react"

export default function AdminVercelDeployNotification() {
  const { deployId, clearDeployId } = useVercelDeploy()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleDeployComplete = () => {
    // Limpar o deployId após o deploy ser concluído
    clearDeployId()
  }

  if (!mounted) {
    return null
  }

  return <VercelDeployNotification deployId={deployId || undefined} onDeployComplete={handleDeployComplete} />
}
