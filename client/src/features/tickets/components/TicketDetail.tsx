'use client'

import { useState, useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Send } from 'lucide-react'
import { replyToTicket, updateTicketStatus } from '@/features/tickets/actions/ticketActions'

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
}

interface Props {
    ticket: Ticket
    currentUserId: string
    isSuperAdmin: boolean
    onBack: () => void
}

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const

const priorityColor: Record<string, string> = {
    CRITICAL: 'destructive',
    HIGH: 'default',
    MEDIUM: 'secondary',
    LOW: 'outline',
}

const statusColor: Record<string, string> = {
    OPEN: 'destructive',
    IN_PROGRESS: 'default',
    RESOLVED: 'secondary',
    CLOSED: 'outline',
}

export function TicketDetail({ ticket, currentUserId, isSuperAdmin, onBack }: Props) {
    const [reply, setReply] = useState('')
    const [isInternal, setIsInternal] = useState(false)
    const [isPending, startTransition] = useTransition()

    function handleReply(e: React.FormEvent) {
        e.preventDefault()
        if (!reply.trim()) return
        startTransition(async () => {
            await replyToTicket(ticket.id, reply, isInternal)
            setReply('')
        })
    }

    function handleStatusChange(status: typeof STATUS_OPTIONS[number]) {
        startTransition(async () => {
            await updateTicketStatus(ticket.id, status)
        })
    }

    const visibleMessages = ticket.messages.filter((m) => isSuperAdmin || !m.isInternal)

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to tickets
            </button>

            <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold">{ticket.title}</h2>
                    <Badge variant={(priorityColor[ticket.priority] as 'default' | 'secondary' | 'outline' | 'destructive') ?? 'secondary'}>
                        {ticket.priority}
                    </Badge>
                    <Badge variant={(statusColor[ticket.status] as 'default' | 'secondary' | 'outline' | 'destructive') ?? 'secondary'}>
                        {ticket.status}
                    </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Opened {new Date(ticket.createdAt).toLocaleString()}</p>
            </div>

            {/* Description */}
            <div className="rounded-xl border bg-card p-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                <p className="text-sm">{ticket.description}</p>
            </div>

            {/* Status (super admin only) */}
            {isSuperAdmin && (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Change status:</span>
                    {STATUS_OPTIONS.map((s) => (
                        <Button
                            key={s}
                            variant={ticket.status === s ? 'default' : 'outline'}
                            size="sm"
                            disabled={isPending || ticket.status === s}
                            onClick={() => handleStatusChange(s)}
                        >
                            {s.replace('_', ' ')}
                        </Button>
                    ))}
                </div>
            )}

            {/* Messages */}
            <div className="space-y-3">
                {visibleMessages.map((msg) => {
                    const isCurrentUser = msg.authorId === currentUserId
                    return (
                        <div key={msg.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-xl p-3 ${
                                msg.isInternal
                                    ? 'bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800'
                                    : isCurrentUser
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                            }`}>
                                {msg.isInternal && <p className="text-xs text-amber-600 dark:text-amber-400 mb-1 font-medium">Internal note</p>}
                                <p className="text-sm">{msg.body}</p>
                                <p className={`text-xs mt-1 ${isCurrentUser && !msg.isInternal ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                    {new Date(msg.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    )
                })}
                {visibleMessages.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-4">No messages yet</p>
                )}
            </div>

            {/* Reply */}
            {ticket.status !== 'CLOSED' && (
                <form onSubmit={handleReply} className="space-y-2">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Write a reply..."
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            disabled={isPending}
                        />
                        <Button type="submit" disabled={isPending || !reply.trim()}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                    {isSuperAdmin && (
                        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isInternal}
                                onChange={(e) => setIsInternal(e.target.checked)}
                                className="rounded"
                            />
                            Internal note (not visible to school)
                        </label>
                    )}
                </form>
            )}
        </div>
    )
}
