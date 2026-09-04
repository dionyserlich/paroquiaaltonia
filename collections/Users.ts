import type { CollectionConfig } from "payload"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.paroquiaaltonia.com.br"

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
  },
  auth: {
    // Os modelos de e-mail que vêm com o Payload são em inglês ("Reset Your
    // Password"), o que destoa do resto do painel. O link precisa apontar
    // para /cms, que é onde o admin fica montado (ver payload.config.ts) —
    // o padrão do Payload assume /admin e levaria a uma página inexistente.
    forgotPassword: {
      generateEmailSubject: () => "Redefinir sua senha — Paróquia São Sebastião",
      generateEmailHTML: ({ token } = {}) => {
        const link = `${baseUrl}/cms/reset/${token}`
        return `
          <div style="font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; line-height: 1.5;">
            <h2 style="margin: 0 0 16px;">Redefinir sua senha</h2>
            <p>Recebemos um pedido para redefinir a senha do seu acesso ao painel da Paróquia São Sebastião.</p>
            <p style="margin: 24px 0;">
              <a href="${link}" style="background: #eab308; color: #4d3600; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                Criar uma nova senha
              </a>
            </p>
            <p style="font-size: 13px; color: #555;">
              Se o botão não funcionar, copie e cole este endereço no navegador:<br />
              <span style="word-break: break-all;">${link}</span>
            </p>
            <p style="font-size: 13px; color: #555;">
              Se não foi você que pediu, pode ignorar esta mensagem — sua senha atual continua valendo.
            </p>
          </div>
        `
      },
    },
  },
  fields: [],
}
