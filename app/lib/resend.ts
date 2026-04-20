import { Resend } from "resend"

type ResendCreds = { apiKey: string; fromEmail: string }
let cachedCreds: ResendCreds | null = null
let cacheExpiresAt = 0

async function fetchReplitResendCreds(): Promise<ResendCreds | null> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  if (!hostname) return null
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? "depl " + process.env.WEB_REPL_RENEWAL
    : null
  if (!xReplitToken) return null

  const res = await fetch(
    `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=resend`,
    { headers: { Accept: "application/json", "X-Replit-Token": xReplitToken } },
  )
  if (!res.ok) return null
  const data = await res.json()
  const item = data.items?.[0]
  if (!item?.settings?.api_key) return null
  return {
    apiKey: item.settings.api_key,
    fromEmail: item.settings.from_email || "onboarding@resend.dev",
  }
}

async function getCreds(): Promise<ResendCreds> {
  const now = Date.now()
  if (cachedCreds && now < cacheExpiresAt) return cachedCreds

  if (process.env.RESEND_API_KEY) {
    cachedCreds = {
      apiKey: process.env.RESEND_API_KEY,
      fromEmail: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
    }
    cacheExpiresAt = now + 60 * 60 * 1000
    return cachedCreds
  }

  const fromReplit = await fetchReplitResendCreds()
  if (!fromReplit) {
    throw new Error("Resend não está configurado (RESEND_API_KEY ausente).")
  }
  cachedCreds = fromReplit
  cacheExpiresAt = now + 5 * 60 * 1000
  return cachedCreds
}

export async function sendEmail(opts: {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}) {
  const { apiKey, fromEmail } = await getCreds()
  const client = new Resend(apiKey)
  return client.emails.send({
    from: fromEmail,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    replyTo: opts.replyTo,
  })
}
