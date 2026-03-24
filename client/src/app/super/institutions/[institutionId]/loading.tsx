export default function Loading() {
    return (
        <div className="space-y-6">
            <div className="h-4 w-24 rounded bg-muted animate-pulse" />
            <div className="space-y-2">
                <div className="h-8 w-64 rounded-lg bg-muted animate-pulse" />
                <div className="flex gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-5 w-16 rounded-full bg-muted animate-pulse" />
                    ))}
                </div>
            </div>
            <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-9 w-24 rounded-lg bg-muted animate-pulse" />
                ))}
            </div>
            <div className="rounded-xl border bg-muted h-64 animate-pulse" />
        </div>
    )
}
