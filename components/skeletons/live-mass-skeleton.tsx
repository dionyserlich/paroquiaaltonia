export default function LiveMassSkeleton() {
  return (
    <div className="flex flex-col items-center text-white">
      <div className="h-8 w-48 bg-gray-700/30 rounded-lg animate-pulse mb-2" />
      <div className="h-16 w-16 bg-yellow-500/50 rounded-full animate-pulse mb-2" />
      <div className="h-6 w-32 bg-gray-700/30 rounded-lg animate-pulse" />
    </div>
  )
}
