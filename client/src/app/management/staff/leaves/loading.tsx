export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="h-4 w-72 rounded-lg bg-muted animate-pulse" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
      <div className="h-10 w-full rounded-lg bg-muted animate-pulse" />
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  )
}
