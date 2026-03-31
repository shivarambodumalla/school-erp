'use client'

import { useState, useEffect } from 'react'
import {
  Radio,
  Video,
  Calendar,
  Clock,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { SubjectModuleItem } from '../../lms-types'

interface Props {
  item: SubjectModuleItem
}

const PLATFORM_LABELS: Record<string, string> = {
  GOOGLE_MEET: 'Google Meet',
  ZOOM: 'Zoom',
  MS_TEAMS: 'Microsoft Teams',
  OTHER: 'Other',
}

export function LiveClassViewer({ item }: Props) {
  const [countdown, setCountdown] = useState('')
  const [status, setStatus] = useState<
    'upcoming' | 'live' | 'ended'
  >('upcoming')

  const scheduledAt = item.scheduledAt
    ? new Date(item.scheduledAt)
    : null
  const durationMs = (item.videoDuration ?? 60) * 60 * 1000

  useEffect(() => {
    if (!scheduledAt) {
      setStatus('upcoming')
      return
    }

    const updateCountdown = () => {
      const now = new Date().getTime()
      const start = scheduledAt.getTime()
      const end = start + durationMs

      if (now < start) {
        setStatus('upcoming')
        const diff = start - now
        const hours = Math.floor(diff / 3600000)
        const minutes = Math.floor(
          (diff % 3600000) / 60000
        )
        const seconds = Math.floor((diff % 60000) / 1000)
        if (hours > 24) {
          const days = Math.floor(hours / 24)
          setCountdown(`${days}d ${hours % 24}h`)
        } else if (hours > 0) {
          setCountdown(
            `${hours}h ${minutes}m ${seconds}s`
          )
        } else {
          setCountdown(`${minutes}m ${seconds}s`)
        }
      } else if (now >= start && now <= end) {
        setStatus('live')
        setCountdown('')
      } else {
        setStatus('ended')
        setCountdown('')
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [scheduledAt, durationMs])

  const platformLabel =
    PLATFORM_LABELS[item.platform ?? ''] ?? item.platform ?? 'Video Call'

  return (
    <div
      className="rounded-xl border bg-card p-6
        flex flex-col items-center gap-5 text-center"
    >
      {/* Status icon */}
      <div
        className={`h-16 w-16 rounded-full flex items-center
          justify-center ${
            status === 'live'
              ? 'bg-green-50'
              : status === 'ended'
                ? 'bg-muted'
                : 'bg-green-50'
          }`}
      >
        {status === 'live' ? (
          <Radio className="h-8 w-8 text-green-600 animate-pulse" />
        ) : status === 'ended' ? (
          <Video className="h-8 w-8 text-muted-foreground" />
        ) : (
          <Video className="h-8 w-8 text-green-600" />
        )}
      </div>

      {/* Title */}
      <div>
        <h2 className="text-lg font-semibold">{item.title}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {platformLabel}
        </p>
      </div>

      {/* Status badge */}
      {status === 'live' && (
        <Badge className="bg-green-600 text-white">
          <span className="mr-1.5 h-2 w-2 rounded-full bg-white animate-pulse inline-block" />
          Live Now
        </Badge>
      )}
      {status === 'ended' && (
        <Badge variant="secondary">Session Ended</Badge>
      )}

      {/* Date & time info */}
      {scheduledAt && (
        <div className="flex flex-wrap gap-3 justify-center">
          <div className="flex items-center gap-1.5 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {scheduledAt.toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {scheduledAt.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          {item.videoDuration && (
            <span className="text-sm text-muted-foreground">
              ({item.videoDuration} min)
            </span>
          )}
        </div>
      )}

      {/* Countdown */}
      {status === 'upcoming' && countdown && (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Starts in
          </p>
          <p className="text-2xl font-bold mt-1 tabular-nums">
            {countdown}
          </p>
        </div>
      )}

      {/* Agenda */}
      {item.agenda && (
        <div className="text-left w-full max-w-md border-t pt-4">
          <h3 className="text-sm font-semibold mb-1">
            Agenda
          </h3>
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {item.agenda}
          </p>
        </div>
      )}

      {/* Join button */}
      {item.meetUrl && status !== 'ended' && (
        <Button
          asChild
          className="min-h-[44px] gap-2"
          variant={status === 'live' ? 'default' : 'outline'}
        >
          <a
            href={item.meetUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4" />
            {status === 'live'
              ? 'Join Now'
              : 'Open Meeting Link'}
          </a>
        </Button>
      )}

      {/* Recording placeholder */}
      {status === 'ended' && (
        <p className="text-sm text-muted-foreground">
          Recording will be available here once uploaded by
          your teacher.
        </p>
      )}
    </div>
  )
}
