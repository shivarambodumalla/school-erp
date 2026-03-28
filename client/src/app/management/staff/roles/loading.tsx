export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-8 w-40 rounded-lg bg-muted animate-pulse" />
          <div className="h-4 w-64 rounded-lg bg-muted animate-pulse" />
        </div>
        <div className="h-10 w-32 rounded-lg bg-muted animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-48 rounded-xl bg-muted animate-pulse"
          />
        ))}
      </div>
    </div>
  )
}
