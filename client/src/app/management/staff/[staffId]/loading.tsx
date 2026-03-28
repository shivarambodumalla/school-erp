export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 w-48 rounded bg-muted animate-pulse" />
          <div className="h-4 w-32 rounded bg-muted animate-pulse" />
        </div>
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-20 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
      <div className="h-96 rounded-xl bg-muted animate-pulse" />
    </div>
  )
}
