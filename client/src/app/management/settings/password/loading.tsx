export default function Loading() {
  return (
    <div className="space-y-6 max-w-md">
      <div className="h-20 rounded-xl bg-muted animate-pulse" />
      <div className="space-y-4">
        <div className="h-16 rounded-lg bg-muted animate-pulse" />
        <div className="h-16 rounded-lg bg-muted animate-pulse" />
        <div className="h-16 rounded-lg bg-muted animate-pulse" />
      </div>
    </div>
  )
}
