export default function Loading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="h-8 w-40 rounded-lg bg-muted animate-pulse" />
                    <div className="h-4 w-56 rounded-lg bg-muted animate-pulse" />
                </div>
                <div className="h-9 w-36 rounded-lg bg-muted animate-pulse" />
            </div>
            <div className="h-10 w-72 rounded-lg bg-muted animate-pulse" />
            <div className="rounded-xl border bg-card h-64 animate-pulse" />
        </div>
    )
}
