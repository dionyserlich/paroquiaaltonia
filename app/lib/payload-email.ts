import type { EmailAdapter } from "payload"
import { sendEmail } from "@/app/lib/resend"

// Sem um adaptador de e-mail, o Payload apenas escreve a mensagem no console
// ("No email adapter provided") — o que em produção significa que o link de
// redefinição de senha vai parar num log de função que ninguém lê, deixando
// o "Esqueci minha senha" sem efeito prático.
//
// Este adaptador liga o Payload ao Resend que o projeto já usa (o mesmo de
// app/lib/resend.ts, das intenções), em vez de trazer outra dependência ou
// outro provedor.

type Destinatario = string | { address?: string; name?: string } | undefined | null

// O Payload usa o formato do nodemailer, onde um destinatário pode ser texto
// puro ou um objeto {name, address}, sozinho ou em lista.
function extrairEnderecos(valor: unknown): string[] {
  if (!valor) return []
  const lista = Array.isArray(valor) ? valor : [valor]
  return lista
    .map((item: Destinatario) => (typeof item === "string" ? item : item?.address))
    .filter((e): e is string => Boolean(e))
}

function paraTexto(valor: unknown): string {
  if (typeof valor === "string") return valor
  if (valor && typeof valor === "object" && "toString" in valor) return String(valor)
  return ""
}

export const resendEmailAdapter: EmailAdapter = ({ payload }) => {
  const remetente = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"

  return {
    name: "resend",
    defaultFromAddress: remetente,
    defaultFromName: "Paróquia São Sebastião",
    sendEmail: async (mensagem) => {
      const destinatarios = extrairEnderecos(mensagem.to)
      const assunto = mensagem.subject ?? "(sem assunto)"

      // Sem chave (ambiente local, por exemplo) mantém o comportamento
      // anterior do Payload em vez de estourar: registra no console para o
      // fluxo continuar utilizável em desenvolvimento.
      if (!process.env.RESEND_API_KEY) {
        payload.logger.warn(
          `RESEND_API_KEY ausente — e-mail não enviado. Para: ${destinatarios.join(", ")} | Assunto: ${assunto}`
        )
        return
      }

      if (destinatarios.length === 0) {
        payload.logger.error("E-mail do Payload sem destinatário; envio ignorado.")
        return
      }

      // O Payload manda html em alguns e-mails e só texto em outros.
      const html = paraTexto(mensagem.html) || `<p>${paraTexto(mensagem.text)}</p>`

      await sendEmail({
        to: destinatarios,
        cc: extrairEnderecos(mensagem.cc),
        subject: assunto,
        html,
      })
    },
  }
}
