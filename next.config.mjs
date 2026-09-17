// dev/build usam --webpack (ver package.json): Turbopack ainda não processa
// corretamente o Tailwind v4 (@theme/@apply passam direto sem compilar).
// Remover a flag quando o suporte do Turbopack a Tailwind v4 amadurecer.
import path from "path"
import { fileURLToPath } from "url"
import { withPayload } from "@payloadcms/next/withPayload"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  agentRules: false,
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      ".cjs": [".cts", ".cjs"],
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    }
    return webpackConfig
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  // URLs do site antigo, que usava id numérico. Elas ainda estão no índice do
  // Google e em links compartilhados.
  //
  // O redirecionamento também existe no código (app/lib/find-by-slug.ts, que
  // busca pelo legacyId), mas ali ele é disparado de dentro da renderização,
  // já com o streaming em curso — o Next não consegue mais definir o status e
  // devolve 200 com um desvio feito no cliente. Para o Google isso não é um
  // redirecionamento: é uma página duplicada e sem conteúdo, que foi
  // exatamente o que o Search Console reportou.
  //
  // Aqui o desvio acontece antes de qualquer renderização, então vira um 308
  // de verdade. A lista é fixa porque a migração do site antigo já terminou:
  // não surgem novos ids legados.
  async redirects() {
    return [
      // Herança do site antigo: /index servia a home. Em produção ele ainda
      // responde 200 com o conteúdo da home (localmente dá 404), ou seja, a
      // mesma página em duas URLs.
      { source: "/index", destination: "/", permanent: true },
      { source: "/noticias/4", destination: "/noticias/inscricoes-abertas-novos-coroinhas", permanent: true },
      {
        source: "/noticias/5",
        destination: "/noticias/pascom-altonia-marca-presenca-no-encontro-diocesano-da-pastoral-da-comunicacao-em-umuarama",
        permanent: true,
      },
      {
        source: "/noticias/6",
        destination: "/noticias/celebracao-da-primeira-eucaristia-emociona-comunidade-paroquial",
        permanent: true,
      },
      { source: "/eventos/2", destination: "/eventos/adoracao-do-santissimo-com-a-r", permanent: true },
      { source: "/eventos/3", destination: "/eventos/grupo-de-oracao-da-rcc-altonia", permanent: true },
      { source: "/eventos/4", destination: "/eventos/adoracao-do-santissimo", permanent: true },
      { source: "/eventos/5", destination: "/eventos/2-luau-maranata", permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
    ]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
