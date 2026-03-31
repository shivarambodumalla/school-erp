export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-full rounded-lg bg-muted animate-pulse" />
      <div className="h-5 w-32 rounded bg-muted animate-pulse ml-auto" />
      <div className="h-10 w-72 rounded-lg bg-muted animate-pulse" />
      <div className="space-y-3 pt-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-xl bg-muted animate-pulse shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-48 rounded bg-muted animate-pulse" />
            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div className="h-64 rounded-xl bg-muted animate-pulse" />
      </div>
    </div>
  )
}
