import "@/app/admin/admin.css"

export default function Loading() {
  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold">Carregando...</h1>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="admin-card">
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          </div>
        </div>
      </main>
    </div>
  )
}
