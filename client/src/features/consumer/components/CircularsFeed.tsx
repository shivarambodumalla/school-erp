'use client'

import { useState, useEffect, useCallback } from 'react'
import { Megaphone, Pin, Calendar, ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface CircularItem {
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

export function CircularsFeed() {
  const [circulars, setCirculars] = useState<CircularItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCircular, setSelectedCircular] = useState<CircularItem | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchCirculars = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/school/circulars?take=50')
      if (!res.ok) throw new Error('Failed')
      const data = await res.json() as { circulars: CircularItem[] }
      const items = data.circulars ?? []
      setCirculars(items)
      setUnreadCount(items.filter(c => !c.isRead).length)
    } catch {
      setCirculars([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCirculars() }, [fetchCirculars])

  const handleOpen = (circular: CircularItem) => {
    setSelectedCircular(circular)
    // Auto-mark as read
    if (!circular.isRead) {
      fetch(`/api/school/circulars/${circular.id}/read`, { method: 'POST' })
        .then(() => {
          setCirculars(prev => prev.map(c =>
            c.id === circular.id ? { ...c, isRead: true } : c
          ))
          setUnreadCount(prev => Math.max(0, prev - 1))
        })
        .catch(() => { /* silent */ })
    }
  }

  // Detail view
  if (selectedCircular) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setSelectedCircular(null)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div>
            <h2 className="text-lg font-bold">{selectedCircular.title}</h2>
            <p className="text-xs text-muted-foreground mt-1">
              By {selectedCircular.createdBy.firstName} {selectedCircular.createdBy.lastName}
              {selectedCircular.publishedAt && (
                <>
                  {' \u00B7 '}
                  {new Date(selectedCircular.publishedAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </>
              )}
            </p>
          </div>
          <div className="prose prose-sm max-w-none text-sm whitespace-pre-wrap">
            {selectedCircular.content}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Circulars</h1>
        {unreadCount > 0 && (
          <span className="inline-flex items-center justify-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
            {unreadCount} new
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : circulars.length === 0 ? (
        <div className="rounded-xl border bg-card flex flex-col items-center justify-center py-16 gap-3">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Megaphone className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-medium">No circulars</p>
          <p className="text-sm text-muted-foreground">
            You&apos;ll see announcements here when they&apos;re published
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Pinned circulars first */}
          {circulars
            .sort((a, b) => {
              if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
              return 0
            })
            .map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleOpen(c)}
                className={`w-full text-left rounded-xl border p-4 transition-colors min-h-[44px]
                  ${c.isRead
                    ? 'bg-card hover:bg-muted/30'
                    : 'bg-primary/[0.02] border-primary/20 hover:bg-primary/[0.05]'
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {c.isPinned && <Pin className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                      {!c.isRead && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                      <h3 className="text-sm font-semibold truncate">{c.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {c.content}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge className="text-[10px] px-1.5 py-0 border-0 bg-muted text-muted-foreground">
                        {c.targetAudience}
                      </Badge>
                      {c.publishedAt && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(c.publishedAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
