"use client"

import { useVercelDeploy } from "@/contexts/vercel-deploy-context"
import VercelDeployNotification from "@/components/vercel-deploy-notification"

export default function AdminVercelDeployNotification() {
  const { deployId, clearDeployId } = useVercelDeploy()

  const handleDeployComplete = () => {
    // Limpar o deployId após o deploy ser concluído
    clearDeployId()
  }

  return <VercelDeployNotification deployId={deployId || undefined} onDeployComplete={handleDeployComplete} />
}
