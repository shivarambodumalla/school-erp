export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-40 rounded bg-muted animate-pulse" />
        <div className="h-4 w-56 rounded bg-muted animate-pulse" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}
              className="h-40 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
        <div className="h-96 rounded-xl bg-muted animate-pulse" />
      </div>
    </div>
  )
}
