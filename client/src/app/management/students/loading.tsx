export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="h-8 w-32 rounded-lg bg-muted animate-pulse" />
        <div className="h-4 w-56 rounded-lg bg-muted animate-pulse" />
      </div>
      <div className="flex gap-4 h-[600px]">
        <div className="w-80 shrink-0 space-y-2 border rounded-xl p-3">
          <div className="h-10 rounded-lg bg-muted animate-pulse" />
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
        <div className="flex-1 rounded-xl bg-muted animate-pulse" />
      </div>
    </div>
  )
}