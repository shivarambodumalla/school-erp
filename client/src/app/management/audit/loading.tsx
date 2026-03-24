export default function Loading() {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <div className="h-8 w-32 rounded-lg bg-muted animate-pulse" />
                <div className="h-4 w-48 rounded-lg bg-muted animate-pulse" />
            </div>
            <div className="h-10 w-72 rounded-lg bg-muted animate-pulse" />
            <div className="rounded-xl border bg-card h-64 animate-pulse" />
        </div>
    )
}
