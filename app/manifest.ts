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
    // Arquivos com o tamanho que realmente declaram. Antes os dois apontavam
    // para logo-icone.png, que é 357x349 — o Android confia no `sizes` pra
    // escolher o ícone e acabava escalando um arquivo do tamanho errado ao
    // instalar o app. `maskable` permite ao sistema recortar no formato do
    // aparelho (círculo, squircle) sem cortar a imagem.
    icons: [
      {
        src: "/images/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
