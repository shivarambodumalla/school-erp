'use client'

import { useEffect } from 'react'
import {
  AlertTriangle,
  Pin,
  Bell,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { MarkdownRenderer } from '../MarkdownRenderer'
import type { SubjectModuleItem } from '../../lms-types'

interface Props {
  item: SubjectModuleItem
  subjectId: string
}

export function AnnouncementViewer({
  item,
  subjectId,
}: Props) {
  // Mark as read on mount
  useEffect(() => {
    fetch(
      `/api/school/subjects/${subjectId}/announcements/${item.id}/read`,
      { method: 'POST' }
    ).catch(() => {
      // Silent fail
    })
  }, [subjectId, item.id])

  let bgClass: string
  let Icon: typeof AlertTriangle

  if (item.isUrgent) {
    bgClass =
      'border-red-200 bg-red-50/50 dark:bg-red-950/30 dark:border-red-800'
    Icon = AlertTriangle
  } else if (item.isPinned) {
    bgClass =
      'border-amber-200 bg-amber-50/50 dark:bg-amber-950/30 dark:border-amber-800'
    Icon = Pin
  } else {
    bgClass =
      'border-blue-200 bg-blue-50/50 dark:bg-blue-950/30 dark:border-blue-800'
    Icon = Bell
  }

  const isExpired = item.expiresAt
    ? new Date(item.expiresAt) < new Date()
    : false

  return (
    <div className={`rounded-xl border p-6 ${bgClass}`}>
      <div className="flex items-start gap-4">
        <div
          className={`h-10 w-10 rounded-full flex items-center
            justify-center shrink-0 ${
              item.isUrgent
                ? 'bg-red-100 dark:bg-red-900'
                : item.isPinned
                  ? 'bg-amber-100 dark:bg-amber-900'
                  : 'bg-blue-100 dark:bg-blue-900'
            }`}
        >
          <Icon
            className={`h-5 w-5 ${
              item.isUrgent
                ? 'text-red-600'
                : item.isPinned
                  ? 'text-amber-600'
                  : 'text-blue-600'
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {item.isUrgent && (
              <Badge
                variant="destructive"
                className="text-xs"
              >
                Urgent
              </Badge>
            )}
            {item.isPinned && (
              <Badge
                variant="outline"
                className="text-xs"
              >
                Pinned
              </Badge>
            )}
            {isExpired && (
              <Badge
                variant="secondary"
                className="text-xs"
              >
                Expired
              </Badge>
            )}
          </div>

          {/* Content */}
          {item.content ? (
            <MarkdownRenderer content={item.content} />
          ) : item.description ? (
            <p className="text-sm">{item.description}</p>
          ) : null}

          {/* Meta */}
          <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Posted{' '}
              {new Date(item.createdAt).toLocaleDateString(
                undefined,
                {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }
              )}
            </span>
            {item.expiresAt && !isExpired && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Expires{' '}
                {new Date(
                  item.expiresAt
                ).toLocaleDateString()}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Read
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
