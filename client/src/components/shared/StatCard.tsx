import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
    title?: string
    label?: string
    value: string | number
    description?: string
    icon?: LucideIcon
    color?: 'blue' | 'green' | 'red' | 'amber' | 'violet' | string
}

const COLOR_CLASSES: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    amber: 'bg-amber-100 text-amber-600',
    violet: 'bg-violet-100 text-violet-600',
}

export function StatCard({ title, label, value, description, icon: Icon, color = 'blue' }: StatCardProps): JSX.Element {
    const displayLabel = label || title || ''
    const iconColorClass = COLOR_CLASSES[color] || COLOR_CLASSES.blue

    return (
        <div className="rounded-xl border bg-card p-4 flex flex-col gap-3">
             {Icon && (
                 <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${iconColorClass}`}>
                     <Icon className="h-5 w-5" />
                 </div>
             )}
            <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{displayLabel}</p>
                <p className="text-2xl font-bold">{value}</p>
                {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            </div>
        </div>
    )
}
