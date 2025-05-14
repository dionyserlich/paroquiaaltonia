export default function NewsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-48 bg-gray-700/30 rounded-lg animate-pulse" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-32 bg-gray-700/30 rounded-lg animate-pulse" />
        <div className="h-32 bg-gray-700/30 rounded-lg animate-pulse" />
      </div>
    </div>
  )
}
