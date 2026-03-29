'use client'

import { useState, useEffect, useCallback } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import {
  Bell, DollarSign, ClipboardCheck, GraduationCap, FileText, Megaphone,
} from 'lucide-react'

interface Notification {
  id: string
  type: string
  title: string
  body: string
  status: string
  priority: string
  createdAt: string
}

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Unread', value: 'UNREAD' },
] as const

const TYPE_ICONS: Record<string, typeof Bell> = {
  FEE_DUE: DollarSign, FEE_PAID: DollarSign, FEE_OVERDUE: DollarSign,
  ATTENDANCE_ABSENT: ClipboardCheck, ATTENDANCE_SUMMARY: ClipboardCheck,
  GRADE_PUBLISHED: GraduationCap,
  ASSIGNMENT_DUE: FileText, HOMEWORK_ASSIGNED: FileText,
  ANNOUNCEMENT: Megaphone,
}

const PRIORITY_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> = {
  URGENT: 'destructive', HIGH: 'default', NORMAL: 'secondary', LOW: 'secondary',
}

export function ConsumerNotificationsClient() {
  const { apiParam } = useInstitutionId()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async (p: number, reset = false) => {
    setLoading(true)
    const sep = apiParam ? '&' : '?'
    const filterQ = filter ? `${sep}filter=${filter}` : ''
    const pageQ = `${filter ? '&' : sep.replace('?', '&') || '?'}page=${p}`
    const res = await fetch(`/api/school/notifications${apiParam}${filterQ}${pageQ}`)
    const data = await res.json()
    const items: Notification[] = data.notifications ?? data ?? []
    setNotifications(prev => reset ? items : [...prev, ...items])
    setHasMore(items.length >= 20)
    setLoading(false)
  }, [apiParam, filter])

  useEffect(() => {
    setPage(1)
    fetchNotifications(1, true)
  }, [fetchNotifications])

  async function markAllRead() {
    await fetch(`/api/school/notifications/read-all${apiParam}`, { method: 'POST' })
    setNotifications(prev => prev.map(n => ({ ...n, status: 'READ' })))
  }

  async function markRead(id: string) {
    await fetch(`/api/school/notifications/${id}/read${apiParam}`, { method: 'POST' })
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, status: 'READ' } : n)
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-sm text-muted-foreground mt-1">Stay updated</p>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors min-h-[44px] ${
                filter === f.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}>{f.label}</button>
          ))}
        </div>
        <Button variant="outline" size="sm" className="min-h-[44px]" onClick={markAllRead}>
          Mark all read
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map(n => {
          const Icon = TYPE_ICONS[n.type] ?? Bell
          const unread = n.status !== 'READ'
          return (
            <Card key={n.id} onClick={() => unread && markRead(n.id)}
              className={`p-4 cursor-pointer transition-shadow hover:shadow-sm ${
                unread ? 'border-primary/20 bg-primary/5' : ''
              }`}>
              <div className="flex items-start gap-3">
                <Icon className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{n.title}</p>
                    {unread && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                    <Badge variant={PRIORITY_VARIANT[n.priority] ?? 'secondary'} className="text-[10px]">
                      {n.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{n.body}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </Card>
          )
        })}
        {notifications.length === 0 && !loading && (
          <p className="text-center text-muted-foreground py-12 text-sm">No notifications yet</p>
        )}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>

      {hasMore && !loading && notifications.length > 0 && (
        <div className="flex justify-center">
          <Button variant="outline" className="min-h-[44px]" onClick={() => {
            const next = page + 1
            setPage(next)
            fetchNotifications(next)
          }}>Load more</Button>
        </div>
      )}
    </div>
  )
}
