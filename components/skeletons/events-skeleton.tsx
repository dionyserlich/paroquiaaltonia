export default function EventsSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-700/30 rounded-lg animate-pulse" />
      ))}
    </div>
  )
}
