export default function Loading() {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
                <div className="h-4 w-64 rounded-lg bg-muted animate-pulse" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="rounded-xl border bg-card p-5 h-24 animate-pulse bg-muted" />
                ))}
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-xl border bg-muted h-64 animate-pulse" />
                <div className="rounded-xl border bg-muted h-64 animate-pulse" />
            </div>
        </div>
    )
}
