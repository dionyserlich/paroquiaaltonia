import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Paróquia São Sebastião de Altônia",
    short_name: "São Sebastião",
    description: "Aplicativo da Paróquia São Sebastião de Altônia",
    start_url: "/",
    display: "standalone",
    background_color: "#0a1e42",
    theme_color: "#0a1e42",
    icons: [
      {
        src: "/images/logo-icone.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/images/logo-icone.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
