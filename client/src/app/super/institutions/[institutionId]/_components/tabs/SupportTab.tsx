'use client'

import { useEffect, useState } from 'react'
import { Ticket, Clock, AlertTriangle } from 'lucide-react'
import { StatCard } from '@/components/shared/StatCard'
import { PRIORITY_COLORS, TICKET_STATUS_COLORS } from '@/lib/colors'

interface TicketRow {
  id: string
  title: string
  priority: string
  status: string
  createdAt: string
  messageCount: number
}

interface SupportData {
  openCount: number
  avgResolutionHours: number
  lastTicketDate: string | null
  tickets: TicketRow[]
}

interface Props { institutionId: string; apiBase: string }

export function SupportTab({ institutionId, apiBase }: Props) {
  const [data, setData] = useState<SupportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${apiBase}/support`, { signal: controller.signal })
      .then(r => r.json())
      .then(d => { setData(d as SupportData); setLoading(false) })
      .catch(err => {
        if (err instanceof Error && err.name === 'AbortError') return
        setError(true)
        setLoading(false)
      })
    return () => controller.abort()
  }, [apiBase])

  if (loading) return (
    <div className="h-48 rounded-xl bg-muted animate-pulse" />
  )

  if (error || !data) return (
    <div className="rounded-xl border border-red-200 bg-red-50
      p-6 text-center text-red-700 text-sm">
      Failed to load support data. Please refresh.
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Open Tickets"
          value={String(data.openCount)}
          icon={Ticket}
          color={data.openCount > 0 ? 'red' : 'green'} />
        <StatCard
          label="Avg Resolution"
          value={data.avgResolutionHours > 0
            ? `${data.avgResolutionHours}h` : 'N/A'
          }
          icon={Clock} color="blue" />
        <StatCard
          label="Last Ticket"
          value={data.lastTicketDate
            ? new Date(data.lastTicketDate)
              .toLocaleDateString('en-IN')
            : 'None'
          }
          icon={AlertTriangle} color="amber" />
      </div>

      <div className="rounded-xl border bg-card">
        <div className="p-4 border-b">
          <h3 className="font-semibold">All Tickets</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {data.tickets.length} total tickets
          </p>
        </div>
        {data.tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center
            py-12 gap-2">
            <Ticket className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No tickets raised yet
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {data.tickets.map(t => (
              <div key={t.id}
                className="flex items-start justify-between
                  px-4 py-3 gap-4 hover:bg-muted/20 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {t.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(t.createdAt).toLocaleDateString('en-IN')}
                    {' · '}{t.messageCount} messages
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`inline-flex items-center
                    px-2 py-0.5 rounded-full text-xs font-medium
                    ${PRIORITY_COLORS[t.priority] ??
                      'bg-gray-100 text-gray-600'}`}>
                    {t.priority}
                  </span>
                  <span className={`inline-flex items-center
                    px-2 py-0.5 rounded-full text-xs font-medium
                    ${TICKET_STATUS_COLORS[t.status] ??
                      'bg-gray-100 text-gray-600'}`}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
