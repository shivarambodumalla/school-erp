export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 rounded-lg bg-muted animate-pulse" />
        <div className="h-10 w-28 rounded-lg bg-muted animate-pulse" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 w-24 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
      <div className="rounded-xl border divide-y">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-4">
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-40 rounded bg-muted animate-pulse" />
              <div className="h-3 w-24 rounded bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
