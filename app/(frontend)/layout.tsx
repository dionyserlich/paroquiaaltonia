import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from 'next/font/google'
import Script from "next/script"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import ServiceWorkerRegister from "@/components/service-worker-register"
import { LiveMassPlayerProvider } from "@/components/live-mass-player-provider"

const GA_MEASUREMENT_ID = "G-CCH49S7VLQ"

const inter = Inter({ subsets: ["latin"] })

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.paroquiaaltonia.com.br"

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Paróquia São Sebastião de Altônia",
    template: "%s - Paróquia São Sebastião"
  },
  description: "Site oficial da Paróquia São Sebastião de Altônia - Missas, eventos, notícias e liturgia diária",
  keywords: ["paróquia", "são sebastião", "altônia", "igreja católica", "missa", "liturgia", "eventos"],
  authors: [{ name: "Paróquia São Sebastião" }],
  creator: "Dionys Erlich",
  // Gerado por app/manifest.ts — a rota real é /manifest.webmanifest, não
  // /manifest.json (esse caminho nunca existiu, quebrava o link do manifest).
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Paróquia São Sebastião",
  },
  generator: 'v0.dev',
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: baseUrl,
    siteName: "Paróquia São Sebastião",
    title: "Paróquia São Sebastião de Altônia",
    description: "Site oficial da Paróquia São Sebastião de Altônia - Missas, eventos, notícias e liturgia diária",
    images: [
      {
        url: "/images/logo-icone.png",
        width: 512,
        height: 512,
        alt: "Logo da Paróquia São Sebastião",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Paróquia São Sebastião de Altônia",
    description: "Site oficial da Paróquia São Sebastião de Altônia - Missas, eventos, notícias e liturgia diária",
    images: ["/images/logo-icone.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: "#0a1e42",
  width: "device-width",
  initialScale: 1,
  // Sem maximumScale fixo — pinch-to-zoom é um dos jeitos mais comuns de
  // pessoa mais velha aumentar o texto no celular; travar o zoom tira essa
  // opção de quem mais precisa dela.
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        {/* Só no (frontend) — não carrega no /cms (app/(payload)/layout.tsx),
            que não deve ser rastreado como tráfego do site público. */}
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <ServiceWorkerRegister />
          {/* Precisa envolver {children} aqui (não dentro de page-client.tsx,
              remontado a cada página) pro player sobreviver à navegação em
              vez de reiniciar o vídeo toda vez que a pessoa troca de página. */}
          <LiveMassPlayerProvider>{children}</LiveMassPlayerProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
