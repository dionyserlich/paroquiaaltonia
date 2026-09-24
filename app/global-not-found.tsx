import Link from "next/link"

// Convenção `global-not-found` do Next: um 404 que é o documento inteiro,
// para URLs de topo que não batem com nenhum route group (nem (frontend),
// nem (payload)/cms). 404s de conteúdo real (ex.: slug de notícia inválido)
// continuam usando app/(frontend)/not-found.tsx, que herda o layout do site.
//
// Este projeto não tem um root layout único — cada route group define o seu
// —, então este arquivo precisa declarar <html>/<body> próprios. Como
// `not-found.tsx`, isso quebrava o `next dev` ("doesn't have a root
// layout"): o loader do Next exige um root layout para todo not-found,
// exceto justamente o global. Requer `experimental.globalNotFound` ligado
// em next.config.mjs.
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
