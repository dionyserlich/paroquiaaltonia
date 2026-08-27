import { Resend } from "resend"

let client: Resend | null = null

function getClient(): Resend {
  if (client) return client
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error("Resend não está configurado (RESEND_API_KEY ausente).")
  }
  client = new Resend(apiKey)
  return client
}

export async function sendEmail(opts: {
  to: string | string[]
  cc?: string | string[]
  subject: string
  html: string
  replyTo?: string
}) {
  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"
  const result = await getClient().emails.send({
    from: fromEmail,
    to: opts.to,
    cc: opts.cc,
    subject: opts.subject,
    html: opts.html,
    replyTo: opts.replyTo,
  })
  const ccStr = opts.cc ? (Array.isArray(opts.cc) ? opts.cc.join(",") : opts.cc) : null
  console.log(
    `[resend] sent from=${fromEmail} to=${Array.isArray(opts.to) ? opts.to.join(",") : opts.to}${ccStr ? ` cc=${ccStr}` : ""} id=${(result as any)?.data?.id ?? "?"} error=${JSON.stringify((result as any)?.error ?? null)}`,
  )
  if ((result as any)?.error) {
    throw new Error(`Resend rejeitou o envio: ${JSON.stringify((result as any).error)}`)
  }
  return result
}
