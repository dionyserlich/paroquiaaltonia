import type { GlobalConfig } from "payload"
import { revalidarCaminhos } from "@/app/lib/revalidar"

export const Ofertas: GlobalConfig = {
  slug: "ofertas",
  hooks: {
    // Invalida o cache na hora em que o conteúdo muda — ver
    // app/lib/revalidar.ts para o porquê do cache existir.
    afterChange: [() => revalidarCaminhos(["/ofertas"])],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "conteudo",
      type: "richText",
    },
  ],
}
