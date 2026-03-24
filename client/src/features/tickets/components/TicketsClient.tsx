'use client'

import { useState, useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, X } from 'lucide-react'
import { TicketDetail } from './TicketDetail'
import { createTicket } from '@/features/tickets/actions/ticketActions'

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
    institutionName?: string
}

interface Props {
    tickets: Ticket[]
    currentUserId: string
    isSuperAdmin?: boolean
}

const STATUS_FILTERS = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const

const priorityColor: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    CRITICAL: 'destructive',
    HIGH: 'default',
    MEDIUM: 'secondary',
    LOW: 'outline',
}

const statusColor: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    OPEN: 'destructive',
    IN_PROGRESS: 'default',
    RESOLVED: 'secondary',
    CLOSED: 'outline',
}

export function TicketsClient({ tickets, currentUserId, isSuperAdmin = false }: Props) {
    const [statusFilter, setStatusFilter] = useState<string>('ALL')
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [priority, setPriority] = useState('MEDIUM')
    const [isPending, startTransition] = useTransition()

    const filtered = tickets.filter((t) => statusFilter === 'ALL' || t.status === statusFilter)

    function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        startTransition(async () => {
            await createTicket({ title, description, priority: priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' })
            setTitle('')
            setDescription('')
            setPriority('MEDIUM')
            setShowForm(false)
        })
    }

    if (selectedTicket) {
        return (
            <TicketDetail
                ticket={selectedTicket}
                currentUserId={currentUserId}
                isSuperAdmin={isSuperAdmin}
                onBack={() => setSelectedTicket(null)}
            />
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{isSuperAdmin ? 'All Support Tickets' : 'Support'}</h1>
                    <p className="text-muted-foreground text-sm mt-1">{tickets.length} tickets total</p>
                </div>
                {!isSuperAdmin && (
                    <Button size="sm" onClick={() => setShowForm(true)}>
                        <Plus className="h-4 w-4 mr-1.5" /> Raise Ticket
                    </Button>
                )}
            </div>

            {/* Status filters */}
            <div className="flex flex-wrap gap-2">
                {STATUS_FILTERS.map((s) => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            statusFilter === s
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                    >
                        {s.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Ticket Cards */}
            <div className="space-y-3">
                {filtered.map((ticket) => (
                    <button
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className="w-full text-left rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow space-y-2"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold">{ticket.title}</p>
                            <div className="flex items-center gap-1.5 shrink-0">
                                <Badge variant={priorityColor[ticket.priority] ?? 'secondary'}>
                                    {ticket.priority}
                                </Badge>
                                <Badge variant={statusColor[ticket.status] ?? 'secondary'}>
                                    {ticket.status.replace('_', ' ')}
                                </Badge>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            {isSuperAdmin && ticket.institutionName && (
                                <span className="font-medium text-foreground">{ticket.institutionName}</span>
                            )}
                            <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                            {ticket.messages.length > 0 && (
                                <span>{ticket.messages.length} message{ticket.messages.length !== 1 ? 's' : ''}</span>
                            )}
                        </div>
                    </button>
                ))}
                {filtered.length === 0 && (
                    <div className="text-center py-16 text-muted-foreground">
                        <p>No tickets found</p>
                    </div>
                )}
            </div>

            {/* Create Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-background rounded-xl border w-full max-w-md p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-lg">Raise a Support Ticket</h2>
                            <button onClick={() => setShowForm(false)}><X className="h-4 w-4" /></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-1">
                                <Label>Title</Label>
                                <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
                            </div>
                            <div className="space-y-1">
                                <Label>Description</Label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    rows={4}
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>Priority</Label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="CRITICAL">Critical</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                                <Button type="submit" disabled={isPending}>{isPending ? 'Submitting…' : 'Submit Ticket'}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
