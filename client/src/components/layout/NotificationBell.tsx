'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Bell, Check } from 'lucide-react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
  id: string
  type: string
  title: string
  body: string
  status: string
  priority: string
  createdAt: string
  data: Record<string, string>
}

const TYPE_COLORS: Record<string, string> = {
  FEE_DUE: 'bg-amber-100 text-amber-600',
  FEE_PAID: 'bg-green-100 text-green-600',
  FEE_OVERDUE: 'bg-red-100 text-red-600',
  ATTENDANCE_ABSENT: 'bg-red-100 text-red-600',
  GRADE_PUBLISHED: 'bg-blue-100 text-blue-600',
  ASSIGNMENT_DUE: 'bg-violet-100 text-violet-600',
  ANNOUNCEMENT: 'bg-green-100 text-green-600',
  LEAVE_APPROVED: 'bg-green-100 text-green-600',
  LEAVE_REJECTED: 'bg-red-100 text-red-600',
  GENERAL: 'bg-gray-100 text-gray-600',
  SYSTEM: 'bg-gray-100 text-gray-600',
}

export function NotificationBell() {
  const { apiParam } = useInstitutionId()
  const [count, setCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/school/notifications/unread-count${apiParam}`
      )
      if (res.ok) {
        const data = await res.json() as { count: number }
        setCount(data.count)
      }
    } catch { /* ignore */ }
  }, [apiParam])

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/school/notifications${apiParam}${apiParam ? '&' : '?'}take=10`
      )
      if (res.ok) {
        const data = await res.json() as { notifications: Notification[] }
        setNotifications(data.notifications)
      }
    } catch { /* ignore */ }
    setLoading(false)
  }, [apiParam])

  // Poll unread count every 60s
  useEffect(() => {
    fetchCount()
    const interval = setInterval(fetchCount, 60_000)
    return () => clearInterval(interval)
  }, [fetchCount])

  // Refetch on window focus
  useEffect(() => {
    const onFocus = () => fetchCount()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [fetchCount])

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (open) fetchNotifications()
  }, [open, fetchNotifications])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const markAllRead = async () => {
    await fetch(
      `/api/school/notifications/read-all${apiParam}`,
      { method: 'POST' }
    )
    setCount(0)
    setNotifications(prev =>
      prev.map(n => ({ ...n, status: 'READ' }))
    )
  }

  const markRead = async (id: string) => {
    await fetch(
      `/api/school/notifications/${id}/read${apiParam}`,
      { method: 'POST' }
    )
    setCount(c => Math.max(0, c - 1))
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, status: 'READ' } : n)
    )
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-muted
          transition-colors min-h-[44px] min-w-[44px]
          flex items-center justify-center"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className={`absolute -top-0.5 -right-0.5 h-5 w-5
            rounded-full bg-red-500 text-white text-[10px]
            font-bold flex items-center justify-center
            ${count > 5 ? 'animate-pulse' : ''}`}>
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80
          rounded-xl border shadow-lg bg-card z-50
          max-h-96 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4
            py-3 border-b">
            <p className="font-semibold text-sm">Notifications</p>
            {count > 0 && (
              <button type="button" onClick={markAllRead}
                className="text-xs text-primary hover:underline
                  flex items-center gap-1">
                <Check className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-14 rounded-lg
                    bg-muted animate-pulse" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center
                justify-center py-10 gap-2">
                <Bell className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No notifications
                </p>
              </div>
            ) : (
              notifications.map(n => (
                <button key={n.id} type="button"
                  onClick={() => markRead(n.id)}
                  className={`w-full text-left px-4 py-3
                    hover:bg-muted/50 transition-colors
                    flex items-start gap-3 border-b last:border-0
                    ${n.status !== 'READ'
                      ? 'border-l-2 border-l-primary bg-primary/5'
                      : ''
                    }`}>
                  <div className={`h-8 w-8 rounded-full shrink-0
                    flex items-center justify-center text-xs
                    ${TYPE_COLORS[n.type] ?? TYPE_COLORS.GENERAL}`}>
                    {n.type.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm truncate
                      ${n.status !== 'READ'
                        ? 'font-semibold' : 'font-medium'
                      }`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground
                      line-clamp-1">
                      {n.body}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground
                    shrink-0 mt-0.5">
                    {formatDistanceToNow(new Date(n.createdAt),
                      { addSuffix: true })}
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <a href="/management/notifications"
            className="block text-center text-xs text-primary
              font-medium py-2.5 border-t hover:bg-muted/50
              transition-colors">
            View all notifications &rarr;
          </a>
        </div>
      )}
    </div>
  )
}
