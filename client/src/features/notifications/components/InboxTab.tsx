'use client'

import { useState, useEffect, useCallback } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import {
  Bell, DollarSign, ClipboardCheck, GraduationCap, FileText, Megaphone,
} from 'lucide-react'

interface Notification { id: string; type: string; title: string; body: string; status: string; createdAt: string }

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Unread', value: 'UNREAD' },
  { label: 'Fee', value: 'FEE' },
  { label: 'Attendance', value: 'ATTENDANCE' },
  { label: 'Grades', value: 'GRADE' },
  { label: 'Assignments', value: 'ASSIGNMENT' },
  { label: 'Announcements', value: 'ANNOUNCEMENT' },
] as const

const TYPE_ICONS: Record<string, typeof Bell> = {
  FEE_DUE: DollarSign, FEE_PAID: DollarSign, FEE_OVERDUE: DollarSign,
  ATTENDANCE_ABSENT: ClipboardCheck, ATTENDANCE_SUMMARY: ClipboardCheck,
  GRADE_PUBLISHED: GraduationCap,
  ASSIGNMENT_DUE: FileText, HOMEWORK_ASSIGNED: FileText,
  ANNOUNCEMENT: Megaphone,
}

export function InboxTab() {
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
    const res = await fetch(
      `/api/school/notifications${apiParam}${filterQ}${filter ? '&' : sep.replace('?', '&') || '?'}page=${p}`
    )
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
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'READ' } : n))
  }

  function loadMore() { const next = page + 1; setPage(next); fetchNotifications(next) }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors min-h-[44px] ${
                filter === f.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" className="min-h-[44px]" onClick={markAllRead}>
          Mark all read
        </Button>
      </div>

      <div className="space-y-2">
        {notifications.map(n => {
          const Icon = TYPE_ICONS[n.type] ?? Bell
          const unread = n.status !== 'READ'
          return (
            <button
              key={n.id}
              onClick={() => unread && markRead(n.id)}
              className={`w-full text-left rounded-xl border p-4 flex items-start gap-3 transition-shadow hover:shadow-sm min-h-[44px] ${
                unread ? 'bg-primary/5 border-primary/20' : 'bg-card'
              }`}
            >
              <Icon className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm truncate">{n.title}</p>
                  {unread && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{n.body}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
              </span>
            </button>
          )
        })}
        {notifications.length === 0 && !loading && (
          <p className="text-center text-muted-foreground py-12 text-sm">No notifications</p>
        )}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>

      {hasMore && !loading && notifications.length > 0 && (
        <div className="flex justify-center">
          <Button variant="outline" className="min-h-[44px]" onClick={loadMore}>
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}
