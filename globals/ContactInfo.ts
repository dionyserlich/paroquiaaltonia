import type { GlobalConfig } from "payload"
import { revalidarCaminhos } from "@/app/lib/revalidar"

// Antes duplicado em vários arquivos (horarios-content, missas-content,
// bottom-navbar) com o mesmo telefone/endereço hardcoded em cada um.
export const ContactInfo: GlobalConfig = {
  slug: "contact-info",
  hooks: {
    // Invalida o cache na hora em que o conteúdo muda — ver
    // app/lib/revalidar.ts para o porquê do cache existir.
    afterChange: [() => revalidarCaminhos(["/", "/api/contato/publico"])],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "telefone",
      type: "text",
    },
    {
      name: "whatsapp",
      type: "text",
      admin: {
        description: "Somente dígitos, com DDI e DDD (ex: 5544998680244)",
      },
    },
    {
      name: "email",
      type: "email",
    },
    {
      name: "endereco",
      type: "text",
    },
  ],
}
