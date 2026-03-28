export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-muted animate-pulse" />
        <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
      </div>
      <div className="h-10 w-full max-w-md rounded-lg bg-muted animate-pulse" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  )
}
