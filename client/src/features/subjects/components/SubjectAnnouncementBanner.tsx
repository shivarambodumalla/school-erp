'use client'

import { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, Bell, Pin, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AnnouncementItem } from '../lms-types'

interface Props {
  subjectId: string
}

export function SubjectAnnouncementBanner({ subjectId }: Props) {
  const [announcements, setAnnouncements] = useState<
    AnnouncementItem[]
  >([])
  const [dismissed, setDismissed] = useState<Set<string>>(
    new Set()
  )

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/school/subjects/${subjectId}/announcements?active=true`
      )
      if (!res.ok) return
      const data = (await res.json()) as {
        announcements: AnnouncementItem[]
      }
      setAnnouncements(data.announcements)
    } catch {
      // Silently fail — banner is supplementary
    }
  }, [subjectId])

  useEffect(() => {
    fetchAnnouncements()
  }, [fetchAnnouncements])

  const handleDismiss = async (id: string) => {
    setDismissed((prev) => new Set([...Array.from(prev), id]))
    try {
      await fetch(
        `/api/school/subjects/${subjectId}/announcements/${id}/read`,
        { method: 'POST' }
      )
    } catch {
      // Dismiss locally regardless
    }
  }

  const visible = announcements.filter(
    (a) => !dismissed.has(a.id) && !a.isRead
  )

  if (visible.length === 0) return null

  return (
    <div className="space-y-2">
      {visible.map((announcement) => (
        <AnnouncementBar
          key={announcement.id}
          announcement={announcement}
          onDismiss={handleDismiss}
        />
      ))}
    </div>
  )
}

function AnnouncementBar({
  announcement,
  onDismiss,
}: {
  announcement: AnnouncementItem
  onDismiss: (id: string) => void
}) {
  let bgClass: string
  let Icon: typeof AlertTriangle

  if (announcement.isUrgent) {
    bgClass =
      'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200'
    Icon = AlertTriangle
  } else if (announcement.isPinned) {
    bgClass =
      'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200'
    Icon = Pin
  } else {
    bgClass =
      'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200'
    Icon = Bell
  }

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border
        px-4 py-3 ${bgClass}`}
      role="alert"
    >
      <Icon className="h-4 w-4 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight">
          {announcement.title}
        </p>
        {announcement.content && (
          <p className="text-xs mt-0.5 opacity-80 line-clamp-2">
            {announcement.content}
          </p>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 -mr-1 -mt-0.5
          hover:bg-black/10 dark:hover:bg-white/10"
        onClick={() => onDismiss(announcement.id)}
        aria-label="Dismiss announcement"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
