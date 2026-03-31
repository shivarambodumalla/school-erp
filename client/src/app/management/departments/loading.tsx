export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
          <div className="h-4 w-64 rounded bg-muted animate-pulse" />
        </div>
        <div className="h-10 w-36 rounded-lg bg-muted animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl border bg-card animate-pulse" />
        ))}
      </div>
      <div className="flex gap-2">
        <div className="h-10 w-64 rounded-lg bg-muted animate-pulse" />
        <div className="h-10 w-20 rounded-lg bg-muted animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card overflow-hidden">
            <div className="h-20 bg-muted animate-pulse" />
            <div className="p-5 space-y-3">
              <div className="h-5 w-32 rounded bg-muted animate-pulse" />
              <div className="h-4 w-full rounded bg-muted animate-pulse" />
              <div className="h-4 w-48 rounded bg-muted animate-pulse" />
              <div className="flex gap-2">
                <div className="h-6 w-16 rounded-full bg-muted animate-pulse" />
                <div className="h-6 w-16 rounded-full bg-muted animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
