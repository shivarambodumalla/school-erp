'use client'

import { Pin, Eye, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const AUDIENCE_COLORS: Record<string, string> = {
  ALL: 'bg-blue-100 text-blue-700',
  STUDENTS: 'bg-violet-100 text-violet-700',
  PARENTS: 'bg-emerald-100 text-emerald-700',
  STAFF: 'bg-amber-100 text-amber-700',
  CLASS: 'bg-indigo-100 text-indigo-700',
}

export interface CircularItem {
  id: string
  title: string
  content: string
  targetAudience: string
  isPinned: boolean
  publishedAt: string | null
  expiresAt: string | null
  readCount: number
  isRead: boolean
  createdBy: { id: string; firstName: string; lastName: string }
}

interface Props {
  circular: CircularItem
  onClick: (circular: CircularItem) => void
}

export function CircularCard({ circular, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={() => onClick(circular)}
      className={`w-full text-left rounded-xl border p-4 transition-colors min-h-[44px]
        ${circular.isRead ? 'bg-card hover:bg-muted/30' : 'bg-primary/[0.02] border-primary/20 hover:bg-primary/[0.05]'}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {circular.isPinned && (
              <Pin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            )}
            {!circular.isRead && (
              <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
            )}
            <h3 className="text-sm font-semibold truncate">{circular.title}</h3>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {circular.content}
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <Badge
              className={`text-[10px] px-1.5 py-0 border-0 ${AUDIENCE_COLORS[circular.targetAudience] ?? 'bg-muted'}`}
            >
              {circular.targetAudience}
            </Badge>

            {circular.publishedAt && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(circular.publishedAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short',
                })}
              </span>
            )}

            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Eye className="h-3 w-3" />
              {circular.readCount} read
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}
