export default function EventoDetalhesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-3/4 bg-gray-700/30 rounded-lg animate-pulse" />
      <div className="h-6 w-1/2 bg-gray-700/30 rounded-lg animate-pulse" />
      <div className="h-64 bg-gray-700/30 rounded-lg animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-700/30 rounded animate-pulse" />
        <div className="h-4 bg-gray-700/30 rounded animate-pulse" />
        <div className="h-4 bg-gray-700/30 rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-gray-700/30 rounded animate-pulse" />
      </div>
    </div>
  )
}
