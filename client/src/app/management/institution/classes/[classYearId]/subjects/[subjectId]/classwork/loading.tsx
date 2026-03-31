export default function Loading() {
  return (
    <div className="flex gap-4 flex-col md:flex-row">
      <div className="md:w-48 shrink-0 space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-11 rounded bg-muted animate-pulse" />
        ))}
      </div>
      <div className="flex-1 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  )
}
