export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-full rounded-lg bg-muted animate-pulse" />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-56 rounded-lg bg-muted animate-pulse" />
          <div className="h-5 w-40 rounded bg-muted animate-pulse" />
        </div>
      </div>
      <div className="h-10 w-72 rounded-lg bg-muted animate-pulse" />
      <div className="space-y-3 pt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  )
}
