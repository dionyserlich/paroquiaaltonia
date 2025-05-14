"use client"

import type { ReactNode } from "react"
import { VercelDeployProvider } from "@/contexts/vercel-deploy-context"
import AdminVercelDeployNotification from "./admin-vercel-deploy-notification"
import "@/app/admin/admin.css"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <VercelDeployProvider>
      {children}
      <AdminVercelDeployNotification />
    </VercelDeployProvider>
  )
}
