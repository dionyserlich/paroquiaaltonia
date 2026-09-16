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
    // escolher o ícone e acabava escalando um arquivo do tamanho errado.
    //
    // SEM `maskable` de propósito. Uma entrada maskable autoriza o sistema a
    // recortar a arte no formato do aparelho, e isso só funciona quando o
    // desenho ocupa apenas o centro (~80%), com margem sobrando. O logo da
    // paróquia preenche a arte inteira: declarar maskable fazia o Android
    // cortar o santo nas bordas e pintar de preto o que era transparente,
    // tanto na tela de abertura quanto no ícone da tela inicial.
    //
    // Sem essa entrada, o sistema trata o PNG como imagem comum, respeita a
    // transparência e mostra o logo redondo inteiro — como era antes.
    icons: [
      {
        src: "/images/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/images/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
