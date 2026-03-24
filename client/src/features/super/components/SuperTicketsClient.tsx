'use client'

import { useState } from 'react'
import { TicketsClient } from '@/features/tickets/components/TicketsClient'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface Message {
    id: string
    authorId: string
    body: string
    isInternal: boolean
    createdAt: Date
}

interface Ticket {
    id: string
    title: string
    description: string
    priority: string
    status: string
    createdAt: Date
    messages: Message[]
    institutionName: string
    institutionId: string
}

interface Props {
    tickets: Ticket[]
    currentUserId: string
    institutions: { id: string; name: string }[]
}

export function SuperTicketsClient({ tickets, currentUserId, institutions }: Props) {
    const [instFilter, setInstFilter] = useState<string>('ALL')
    const [search, setSearch] = useState('')

    const filtered = tickets.filter((t) => {
        const matchesInst = instFilter === 'ALL' || t.institutionId === instFilter
        const matchesSearch = search === '' ||
            t.title.toLowerCase().includes(search.toLowerCase()) ||
            t.institutionName.toLowerCase().includes(search.toLowerCase())
        return matchesInst && matchesSearch
    })

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tickets..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    value={instFilter}
                    onChange={(e) => setInstFilter(e.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                    <option value="ALL">All institutions</option>
                    {institutions.map((inst) => (
                        <option key={inst.id} value={inst.id}>{inst.name}</option>
                    ))}
                </select>
            </div>
            <TicketsClient
                tickets={filtered}
                currentUserId={currentUserId}
                isSuperAdmin={true}
            />
        </div>
    )
}
