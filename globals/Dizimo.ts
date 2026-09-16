import type { GlobalConfig } from "payload"
import { revalidarCaminhos } from "@/app/lib/revalidar"

export const Dizimo: GlobalConfig = {
  slug: "dizimo",
  hooks: {
    // Invalida o cache na hora em que o conteúdo muda — ver
    // app/lib/revalidar.ts para o porquê do cache existir.
    afterChange: [() => revalidarCaminhos(["/dizimo"])],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "conteudo",
      type: "richText",
    },
    {
      name: "chavePix",
      type: "text",
    },
  ],
}
