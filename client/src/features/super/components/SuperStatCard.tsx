import type { LucideIcon } from 'lucide-react'

interface Props {
    label: string
    value: number | string
    icon: LucideIcon
    color: 'blue' | 'green' | 'violet' | 'amber' | 'red'
}

const colorMap = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
}

export function SuperStatCard({ label, value, icon: Icon, color }: Props) {
    return (
        <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-3xl font-bold mt-1">{value}</p>
                </div>
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </div>
    )
}
