export default function Loading() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="h-8 w-48 rounded bg-muted animate-pulse" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  )
}