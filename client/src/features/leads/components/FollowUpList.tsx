'use client'

import { useState, useEffect, useCallback } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import {
  Phone, MessageSquare, Mail, Send,
  CheckCircle2, Clock, AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LIST_PAGE_CLASS } from '@/lib/table-constants'

/* ─── Types ─── */

interface FollowUpItem {
  id: string
  channel: string
  scheduledAt: string
  completedAt: string | null
  notes: string | null
  outcome: string | null
  lead: {
    id: string
    name: string
    phone: string
    status: string
    targetClass: { name: string } | null
  }
  staff: { id: string; firstName: string; lastName: string }
}

/* ─── Constants ─── */

type FilterKey = 'today' | 'overdue' | 'all'

const CHANNEL_ICONS: Record<string, typeof Phone> = {
  CALL: Phone,
  WHATSAPP: MessageSquare,
  EMAIL: Mail,
  SMS: Send,
}

const CHANNEL_COLORS: Record<string, string> = {
  CALL: 'bg-blue-100 text-blue-700',
  WHATSAPP: 'bg-green-100 text-green-700',
  EMAIL: 'bg-purple-100 text-purple-700',
  SMS: 'bg-orange-100 text-orange-700',
}

const CHANNEL_LABELS: Record<string, string> = {
  CALL: 'Call',
  WHATSAPP: 'WhatsApp',
  EMAIL: 'Email',
  SMS: 'SMS',
}

/* ─── Component ─── */

export function FollowUpList() {
  const { addParams } = useInstitutionId()
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterKey>('today')
  const [todayCount, setTodayCount] = useState(0)
  const [overdueCount, setOverdueCount] = useState(0)
  const [markingDone, setMarkingDone] = useState<string | null>(null)
  const [outcomeMap, setOutcomeMap] = useState<Record<string, string>>({})

  const fetchFollowUps = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('filter', filter)
    params.set('take', '100')
    addParams(params)

    try {
      const res = await fetch(`/api/school/leads/follow-ups?${params}`)
      if (!res.ok) { setFollowUps([]); return }
      const data = await res.json() as {
        followUps: FollowUpItem[]
        total: number
        todayCount: number
        overdueCount: number
      }
      setFollowUps(data.followUps ?? [])
      setTodayCount(data.todayCount ?? 0)
      setOverdueCount(data.overdueCount ?? 0)
    } catch {
      setFollowUps([])
    } finally {
      setLoading(false)
    }
  }, [filter, addParams])

  useEffect(() => { fetchFollowUps() }, [fetchFollowUps])

  const markDone = useCallback(async (fuId: string) => {
    setMarkingDone(fuId)
    const params = new URLSearchParams()
    addParams(params)
    try {
      const res = await fetch(`/api/school/leads/follow-ups?${params}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fuId, outcome: outcomeMap[fuId] ?? '' }),
      })
      if (res.ok) {
        fetchFollowUps()
      }
    } catch { /* */ } finally {
      setMarkingDone(null)
    }
  }, [addParams, fetchFollowUps, outcomeMap])

  const now = new Date()

  return (
    <div className={LIST_PAGE_CLASS} style={{ height: 'calc(100vh - 24px)' }}>
      <div className="flex flex-col gap-3 flex-1 min-h-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 shrink-0">
          <h1 className="text-2xl font-bold tracking-tight">Follow-ups</h1>
        </div>

        {/* Tab pills */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none shrink-0">
          <button
            type="button"
            onClick={() => setFilter('today')}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors min-h-[36px]
              ${filter === 'today' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            Today{'\u2019'}s
            {todayCount > 0 && (
              <span className={`text-xs ${filter === 'today' ? 'text-primary-foreground/80' : ''}`}>{todayCount}</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setFilter('overdue')}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors min-h-[36px]
              ${filter === 'overdue' ? 'bg-red-600 text-white' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            Overdue
            {overdueCount > 0 && (
              <span className={`text-xs ${filter === 'overdue' ? 'text-white/80' : 'text-red-600'}`}>{overdueCount}</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors min-h-[36px]
              ${filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            All
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border p-4 space-y-2">
                <div className="h-5 w-48 bg-muted animate-pulse rounded" />
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : followUps.length === 0 ? (
          <div className="rounded-xl border bg-card flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium">
              {filter === 'today' ? 'No follow-ups scheduled for today' :
               filter === 'overdue' ? 'No overdue follow-ups' :
               'No follow-ups found'}
            </p>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto space-y-3">
            {followUps.map(fu => {
              const ChannelIcon = CHANNEL_ICONS[fu.channel] ?? Phone
              const isOverdue = !fu.completedAt && new Date(fu.scheduledAt) < now
              const isDone = !!fu.completedAt

              return (
                <div
                  key={fu.id}
                  className={`rounded-xl border bg-card p-4 transition-colors
                    ${isDone ? 'opacity-60' : ''}
                    ${isOverdue && !isDone ? 'border-red-200 bg-red-50/50' : ''}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    {/* Lead info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{fu.lead.name}</span>
                        <a
                          href={`tel:${fu.lead.phone}`}
                          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                        >
                          <Phone className="h-3 w-3" />
                          {fu.lead.phone}
                        </a>
                        {fu.lead.targetClass && (
                          <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            {fu.lead.targetClass.name}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${CHANNEL_COLORS[fu.channel] ?? 'bg-gray-100 text-gray-600'}`}>
                          <ChannelIcon className="h-3 w-3" />
                          {CHANNEL_LABELS[fu.channel] ?? fu.channel}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(fu.scheduledAt).toLocaleString()}
                        </span>
                        {isOverdue && !isDone && (
                          <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                            <AlertCircle className="h-3 w-3" />
                            Overdue
                          </span>
                        )}
                        {isDone && (
                          <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                            <CheckCircle2 className="h-3 w-3" />
                            Done
                          </span>
                        )}
                      </div>

                      {fu.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{fu.notes}</p>
                      )}
                      {fu.outcome && (
                        <p className="text-sm text-foreground mt-1 font-medium">Outcome: {fu.outcome}</p>
                      )}
                    </div>

                    {/* Actions */}
                    {!isDone && (
                      <div className="flex items-center gap-2 shrink-0">
                        {fu.channel === 'WHATSAPP' && (
                          <a
                            href={`https://wa.me/${fu.lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${fu.lead.name.split(' ')[0]}, following up regarding admission enquiry.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border text-sm font-medium
                              text-green-600 hover:bg-green-50 transition-colors min-h-[44px]"
                          >
                            <MessageSquare className="h-4 w-4" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </a>
                        )}
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            placeholder="Outcome..."
                            value={outcomeMap[fu.id] ?? ''}
                            onChange={e => setOutcomeMap(prev => ({ ...prev, [fu.id]: e.target.value }))}
                            className="rounded-md border px-2 py-1.5 text-sm w-32 sm:w-40 min-h-[44px] bg-background"
                          />
                          <Button
                            size="sm"
                            className="min-h-[44px] gap-1.5"
                            onClick={() => markDone(fu.id)}
                            disabled={markingDone === fu.id}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="hidden sm:inline">
                              {markingDone === fu.id ? 'Saving...' : 'Done'}
                            </span>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
