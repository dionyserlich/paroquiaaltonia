// dev/build usam --webpack (ver package.json): Turbopack ainda não processa
// corretamente o Tailwind v4 (@theme/@apply passam direto sem compilar).
// Remover a flag quando o suporte do Turbopack a Tailwind v4 amadurecer.
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  devIndicators: false,
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

export default nextConfig
