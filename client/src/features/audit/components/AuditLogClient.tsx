'use client'

import { useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'

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

const DATE_FILTERS = ['Today', 'Last 7 days', 'Last 30 days'] as const
const ACTION_OPTIONS = ['created', 'updated', 'deleted', 'PASSWORD_CHANGED', 'MASQUERADE_START', 'MASQUERADE_STOP'] as const

const actionBadgeColor: Record<string, string> = {
    created: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    updated: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    deleted: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    PASSWORD_CHANGED: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    MASQUERADE_START: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
    MASQUERADE_STOP: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
}

function filterByDate(log: AuditEntry, dateFilter: string): boolean {
    if (!dateFilter) return true
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
    const [dateFilter, setDateFilter] = useState('')
    const [actions, setActions] = useState<string[]>([])
    const [expanded, setExpanded] = useState<string | null>(null)

    const toggleAction = (a: string) => {
        setActions(prev =>
            prev.includes(a) ? prev.filter(v => v !== a) : [...prev, a],
        )
    }

    const setDate = (d: string) => {
        setDateFilter(prev => prev === d ? '' : d)
    }

    const activeFilterCount = actions.length + (dateFilter ? 1 : 0)

    const filtered = logs.filter((log) => {
        const matchesSearch =
            search === '' ||
            log.action.toLowerCase().includes(search.toLowerCase()) ||
            log.userId.toLowerCase().includes(search.toLowerCase()) ||
            log.tableName.toLowerCase().includes(search.toLowerCase())
        const matchesAction = actions.length === 0 || actions.includes(log.action)
        const matchesDate = filterByDate(log, dateFilter)
        return matchesSearch && matchesAction && matchesDate
    })

    return (
        <div className="space-y-6">
            {/* Toolbar: Title left | Search + Filter right */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h1 className="text-2xl font-bold tracking-tight shrink-0">Audit Log</h1>
                <div className="flex items-center gap-2">
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            className="pl-9 w-full sm:w-48"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="icon" className="min-h-[44px] min-w-[44px] relative">
                                <SlidersHorizontal className="h-4 w-4" />
                                {activeFilterCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary
                                        text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-56 p-0">
                            {/* Date filter — radio-style (single select) */}
                            <div className="px-3 py-2.5 border-b">
                                <p className="text-sm font-medium">Date Range</p>
                            </div>
                            <div className="p-2 space-y-0.5">
                                {DATE_FILTERS.map(d => (
                                    <button key={d} type="button"
                                        onClick={() => setDate(d)}
                                        className="flex w-full items-center gap-2.5 px-2 py-2 rounded-md
                                            hover:bg-muted/50 cursor-pointer transition-colors text-left">
                                        <span className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0
                                            ${dateFilter === d ? 'border-primary' : 'border-muted-foreground/40'}`}>
                                            {dateFilter === d && <span className="h-2 w-2 rounded-full bg-primary" />}
                                        </span>
                                        <span className="text-sm">{d}</span>
                                    </button>
                                ))}
                            </div>
                            {/* Action filter — checkbox (multi select) */}
                            <div className="px-3 py-2.5 border-b border-t">
                                <p className="text-sm font-medium">Action</p>
                            </div>
                            <div className="p-2 space-y-0.5">
                                {ACTION_OPTIONS.map(a => (
                                    <label key={a}
                                        className="flex items-center gap-2.5 px-2 py-2 rounded-md
                                            hover:bg-muted/50 cursor-pointer transition-colors">
                                        <Checkbox
                                            checked={actions.includes(a)}
                                            onCheckedChange={() => toggleAction(a)}
                                        />
                                        <span className="text-sm">{a}</span>
                                    </label>
                                ))}
                            </div>
                            {activeFilterCount > 0 && (
                                <div className="px-3 py-2 border-t">
                                    <button type="button" onClick={() => { setDateFilter(''); setActions([]) }}
                                        className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                                        Clear all
                                    </button>
                                </div>
                            )}
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border bg-card overflow-hidden">
                <div className="overflow-auto max-h-[calc(100vh-220px)]">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 z-[1] bg-muted/95 backdrop-blur-sm">
                            <tr className="border-b">
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">User</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Table</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Record</th>
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
                                        <td className="px-4 py-3 text-muted-foreground font-mono text-xs hidden sm:table-cell">{log.userId.slice(0, 8)}…</td>
                                        <td className="px-4 py-3 text-muted-foreground">{log.tableName}</td>
                                        <td className="px-4 py-3 text-muted-foreground font-mono text-xs hidden lg:table-cell">{log.recordId.slice(0, 8)}…</td>
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
