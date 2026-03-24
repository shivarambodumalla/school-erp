'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface AuditEntry {
    id: string
    action: string
    tableName: string
    recordId: string
    before: unknown
    after: unknown
    createdAt: Date
    userId: string
}

interface Props {
    logs: AuditEntry[]
}

const DATE_FILTERS = ['Today', 'Last 7 days', 'Last 30 days', 'All'] as const
const ACTION_FILTERS = ['ALL', 'created', 'updated', 'deleted', 'PASSWORD_CHANGED', 'MASQUERADE_START', 'MASQUERADE_STOP'] as const

const actionBadgeColor: Record<string, string> = {
    created: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    updated: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    deleted: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    PASSWORD_CHANGED: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    MASQUERADE_START: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
    MASQUERADE_STOP: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
}

function filterByDate(log: AuditEntry, dateFilter: string): boolean {
    if (dateFilter === 'All') return true
    const now = new Date()
    const logDate = new Date(log.createdAt)
    if (dateFilter === 'Today') {
        return logDate.toDateString() === now.toDateString()
    }
    const days = dateFilter === 'Last 7 days' ? 7 : 30
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    return logDate >= cutoff
}

export function AuditLogClient({ logs }: Props) {
    const [search, setSearch] = useState('')
    const [dateFilter, setDateFilter] = useState<string>('All')
    const [actionFilter, setActionFilter] = useState<string>('ALL')
    const [expanded, setExpanded] = useState<string | null>(null)

    const filtered = logs.filter((log) => {
        const matchesSearch =
            search === '' ||
            log.action.toLowerCase().includes(search.toLowerCase()) ||
            log.userId.toLowerCase().includes(search.toLowerCase()) ||
            log.tableName.toLowerCase().includes(search.toLowerCase())
        const matchesAction = actionFilter === 'ALL' || log.action === actionFilter
        const matchesDate = filterByDate(log, dateFilter)
        return matchesSearch && matchesAction && matchesDate
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Audit Log</h1>
                <p className="text-muted-foreground text-sm mt-1">Track all admin actions</p>
            </div>

            {/* Filters */}
            <div className="space-y-3">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by action or user..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {DATE_FILTERS.map((d) => (
                        <button
                            key={d}
                            onClick={() => setDateFilter(d)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                dateFilter === d
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                        >
                            {d}
                        </button>
                    ))}
                </div>
                <div className="flex flex-wrap gap-2">
                    {ACTION_FILTERS.map((a) => (
                        <button
                            key={a}
                            onClick={() => setActionFilter(a)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                actionFilter === a
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                        >
                            {a}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Table</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Record</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((log) => (
                                <>
                                    <tr
                                        key={log.id}
                                        className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                                        onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                                    >
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${actionBadgeColor[log.action] ?? 'bg-muted text-muted-foreground'}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{log.userId.slice(0, 8)}…</td>
                                        <td className="px-4 py-3 text-muted-foreground">{log.tableName}</td>
                                        <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{log.recordId.slice(0, 8)}…</td>
                                        <td className="px-4 py-3 text-muted-foreground text-xs">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                    {expanded === log.id && (log.before ?? log.after) && (
                                        <tr key={`${log.id}-expand`} className="border-b bg-muted/20">
                                            <td colSpan={5} className="px-4 py-3">
                                                <div className="grid sm:grid-cols-2 gap-4">
                                                    {log.before != null && (
                                                        <div>
                                                            <p className="text-xs font-medium text-muted-foreground mb-1">Before</p>
                                                            <pre className="text-xs bg-background rounded p-2 overflow-x-auto border">
                                                                {JSON.stringify(log.before, null, 2)}
                                                            </pre>
                                                        </div>
                                                    )}
                                                    {log.after != null && (
                                                        <div>
                                                            <p className="text-xs font-medium text-muted-foreground mb-1">After</p>
                                                            <pre className="text-xs bg-background rounded p-2 overflow-x-auto border">
                                                                {JSON.stringify(log.after, null, 2)}
                                                            </pre>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <p className="text-center text-muted-foreground py-12 text-sm">No audit logs found</p>
                    )}
                </div>
            </div>
        </div>
    )
}
