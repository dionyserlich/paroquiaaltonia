import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Paróquia São Sebastião de Altônia",
    template: "%s - Paróquia São Sebastião"
  },
  description: "Site oficial da Paróquia São Sebastião de Altônia - Missas, eventos, notícias e liturgia diária",
  keywords: ["paróquia", "são sebastião", "altônia", "igreja católica", "missa", "liturgia", "eventos"],
  authors: [{ name: "Paróquia São Sebastião" }],
  creator: "Dionys Erlich",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Paróquia São Sebastião",
  },
  generator: 'v0.dev',
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://paroquiasaosebastiao.com.br",
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
  maximumScale: 1,
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
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
