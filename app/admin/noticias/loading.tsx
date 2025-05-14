export default function Loading() {
  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold">Carregando...</h1>
        </div>
      </header>
      <main className="container mx-auto p-4">
        <div className="admin-loading">Carregando notícias...</div>
      </main>
    </div>
  )
}
