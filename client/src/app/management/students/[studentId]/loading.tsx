export default function Loading() {
    return (
        <div className="space-y-6">
            {/* Hero skeleton */}
            <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-xl bg-muted animate-pulse" />
                <div className="space-y-2 flex-1">
                    <div className="h-7 w-48 rounded bg-muted animate-pulse" />
                    <div className="h-4 w-64 rounded bg-muted animate-pulse" />
                    <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                </div>
            </div>
            {/* Tabs skeleton */}
            <div className="flex gap-4 border-b pb-2">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-4 w-20 rounded bg-muted animate-pulse" />
                ))}
            </div>
            <div className="h-64 rounded-xl bg-muted animate-pulse" />
        </div>
    )
}
