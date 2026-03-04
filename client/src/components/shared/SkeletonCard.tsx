export function SkeletonCard(): JSX.Element {
    return (
        <div className="rounded-lg border p-4 space-y-3 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-8 bg-muted rounded w-1/2" />
            <div className="h-3 bg-muted rounded w-2/3" />
        </div>
    )
}
