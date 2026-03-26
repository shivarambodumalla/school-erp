export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Hero skeleton */}
      <div className="rounded-xl border bg-card p-6 animate-pulse">
        <div className="flex gap-4">
          <div className="h-16 w-16 rounded-xl bg-muted shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-6 w-48 rounded bg-muted" />
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="flex gap-2">
              <div className="h-6 w-20 rounded-full bg-muted" />
              <div className="h-6 w-16 rounded-full bg-muted" />
              <div className="h-6 w-24 rounded-full bg-muted" />
            </div>
          </div>
          <div className="hidden md:flex gap-2">
            <div className="h-8 w-24 rounded-md bg-muted" />
            <div className="h-8 w-36 rounded-md bg-muted" />
            <div className="h-8 w-16 rounded-md bg-muted" />
          </div>
        </div>
      </div>
      {/* Tabs skeleton */}
      <div className="h-10 rounded-lg bg-muted animate-pulse" />
      {/* Content skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}
            className="h-28 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-muted animate-pulse" />
    </div>
  )
}
