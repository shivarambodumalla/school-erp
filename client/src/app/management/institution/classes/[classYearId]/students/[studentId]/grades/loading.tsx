export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-16 rounded-xl bg-muted animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  )
}
