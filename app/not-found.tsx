import Link from "next/link"

// Cobre only o caso de uma URL de topo que não bate com nenhum route group
// (nem (frontend), nem (payload)/cms) — 404s de conteúdo real (ex.: slug de
// notícia inválido) já usam app/(frontend)/not-found.tsx normalmente. Como
// não há um único root layout compartilhado entre os route groups deste
// projeto, este arquivo precisa definir <html>/<body> próprios.
export default function GlobalNotFound() {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "24px",
          backgroundColor: "#00143d",
          color: "#fff",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <h1 style={{ fontSize: "3.5rem", fontWeight: 700, color: "#eab308", margin: "0 0 1rem" }}>404</h1>
        <p style={{ fontSize: "1.125rem", margin: "0 0 0.5rem" }}>Página não encontrada</p>
        <p style={{ color: "#d1d5db", margin: "0 0 2rem" }}>
          O conteúdo que você procura não existe ou foi removido.
        </p>
        <Link
          href="/"
          style={{
            backgroundColor: "#eab308",
            color: "#0a1e42",
            fontWeight: 600,
            padding: "0.75rem 1.5rem",
            borderRadius: "9999px",
            textDecoration: "none",
          }}
        >
          Voltar para o início
        </Link>
      </body>
    </html>
  )
}
