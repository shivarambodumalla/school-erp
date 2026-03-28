export default function AdmissionsLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-muted animate-pulse rounded" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="space-y-3 rounded-xl border p-4">
            <div className="h-5 w-24 bg-muted animate-pulse rounded" />
            {[1, 2, 3].map(j => (
              <div key={j} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
