'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface LogEntry {
    id: string
    channel: string
    subject: string | null
    body: string
    status: string
    sentAt: Date
    studentId: string
}

interface Props {
    logs: LogEntry[]
}

const CHANNEL_FILTERS = ['ALL', 'WHATSAPP', 'SMS', 'EMAIL', 'PUSH'] as const

const channelColor: Record<string, string> = {
    WHATSAPP: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    SMS: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    EMAIL: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
    PUSH: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
}

const DATE_FILTERS = ['This month', 'Last 7 days', 'All'] as const

function filterByDate(log: LogEntry, dateFilter: string): boolean {
    if (dateFilter === 'All') return true
    const now = new Date()
    const logDate = new Date(log.sentAt)
    if (dateFilter === 'Last 7 days') {
        return logDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }
    return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear()
}

export function CommunicationLogClient({ logs }: Props) {
    const [search, setSearch] = useState('')
    const [channelFilter, setChannelFilter] = useState<string>('ALL')
    const [dateFilter, setDateFilter] = useState<string>('All')
    const [expanded, setExpanded] = useState<string | null>(null)

    const filtered = logs.filter((log) => {
        const matchesSearch = search === '' || log.studentId.includes(search) || log.subject?.toLowerCase().includes(search.toLowerCase())
        const matchesChannel = channelFilter === 'ALL' || log.channel === channelFilter
        const matchesDate = filterByDate(log, dateFilter)
        return matchesSearch && matchesChannel && matchesDate
    })

    const thisMonth = logs.filter((l) => filterByDate(l, 'This month'))
    const channelCounts = CHANNEL_FILTERS.slice(1).reduce<Record<string, number>>((acc, ch) => {
        acc[ch] = thisMonth.filter((l) => l.channel === ch).length
        return acc
    }, {})

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Communication Log</h1>
                <p className="text-muted-foreground text-sm mt-1">Parent &amp; student messaging history</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-xl border bg-card p-4">
                    <p className="text-xs text-muted-foreground">Total this month</p>
                    <p className="text-2xl font-bold">{thisMonth.length}</p>
                </div>
                {Object.entries(channelCounts).map(([ch, count]) => (
                    <div key={ch} className="rounded-xl border bg-card p-4">
                        <p className="text-xs text-muted-foreground">{ch}</p>
                        <p className="text-2xl font-bold">{count}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="space-y-3">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by subject..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {CHANNEL_FILTERS.map((ch) => (
                        <button
                            key={ch}
                            onClick={() => setChannelFilter(ch)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                channelFilter === ch
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                        >
                            {ch}
                        </button>
                    ))}
                    <div className="w-px bg-border mx-1" />
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
            </div>

            {/* Table */}
            <div className="rounded-xl border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Channel</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Subject</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
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
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${channelColor[log.channel] ?? 'bg-muted text-muted-foreground'}`}>
                                                {log.channel}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-medium">{log.subject ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={log.status === 'SENT' || log.status === 'DELIVERED' ? 'default' : 'destructive'}>
                                                {log.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground text-xs">
                                            {new Date(log.sentAt).toLocaleString()}
                                        </td>
                                    </tr>
                                    {expanded === log.id && (
                                        <tr key={`${log.id}-expand`} className="border-b bg-muted/20">
                                            <td colSpan={4} className="px-4 py-3">
                                                <p className="text-sm whitespace-pre-wrap">{log.body}</p>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <p className="text-center text-muted-foreground py-12 text-sm">No communications found</p>
                    )}
                </div>
            </div>
        </div>
    )
}
