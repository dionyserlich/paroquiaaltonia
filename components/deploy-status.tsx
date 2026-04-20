"use client"

// Deprecated: kept as a no-op after migration from Vercel deploy-based persistence to a database.
// All admin saves now persist directly to Postgres, so there is no deploy to monitor.
export default function DeployStatus(_props: { commitSha?: string; onDeployComplete?: () => void }) {
  return null
}
