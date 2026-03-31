export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-xl bg-muted animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-7 w-48 rounded-lg bg-muted animate-pulse" />
          <div className="h-4 w-64 rounded bg-muted animate-pulse" />
          <div className="flex gap-2">
            <div className="h-6 w-16 rounded-full bg-muted animate-pulse" />
            <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
          </div>
        </div>
        <div className="h-10 w-20 rounded-lg bg-muted animate-pulse" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="h-24 rounded-xl border bg-card animate-pulse" />
        <div className="h-24 rounded-xl border bg-card animate-pulse" />
      </div>

      <div className="flex gap-2 border-b pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-24 rounded bg-muted animate-pulse" />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl border bg-card animate-pulse" />
        ))}
      </div>
    </div>
  )
}
