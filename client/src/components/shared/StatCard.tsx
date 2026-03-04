interface StatCardProps {
    title: string
    value: string | number
    description?: string
}

export function StatCard({ title, value, description }: StatCardProps): JSX.Element {
    return (
        <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {description ? <p className="text-xs text-muted-foreground mt-1">{description}</p> : null}
        </div>
    )
}
