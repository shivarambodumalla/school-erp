'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Megaphone, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CircularCard, type CircularItem } from './CircularCard'
import { CreateCircularSheet } from './CreateCircularSheet'
import { useToast } from '@/hooks/use-toast'

type TabKey = 'all' | 'pinned'

export function CircularsClient() {
  const [circulars, setCirculars] = useState<CircularItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabKey>('all')
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editCircular, setEditCircular] = useState<CircularItem | null>(null)
  const [selectedCircular, setSelectedCircular] = useState<CircularItem | null>(null)
  const { toast } = useToast()

  const fetchCirculars = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (tab === 'pinned') params.set('pinned', 'true')
    params.set('take', '50')

    try {
      const res = await fetch(`/api/school/circulars?${params}`)
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json() as { circulars: CircularItem[] }
      setCirculars(data.circulars ?? [])
    } catch {
      setCirculars([])
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => { fetchCirculars() }, [fetchCirculars])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this circular?')) return
    try {
      const res = await fetch(`/api/school/circulars/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      toast({ title: 'Circular deleted' })
      setSelectedCircular(null)
      fetchCirculars()
    } catch {
      toast({ title: 'Failed to delete', variant: 'destructive' })
    }
  }

  const handleCardClick = (circular: CircularItem) => {
    setSelectedCircular(circular)
    // Mark as read
    if (!circular.isRead) {
      fetch(`/api/school/circulars/${circular.id}/read`, { method: 'POST' })
        .catch(() => { /* silent */ })
    }
  }

  const filteredCirculars = search
    ? circulars.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))
    : circulars

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pinned', label: 'Pinned' },
  ]

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
          Back to circulars
        </button>

        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
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
            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="min-h-[44px]"
                onClick={() => {
                  setEditCircular(selectedCircular)
                  setCreateOpen(true)
                }}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="min-h-[44px]"
                onClick={() => handleDelete(selectedCircular.id)}
              >
                Delete
              </Button>
            </div>
          </div>

          <div className="prose prose-sm max-w-none text-sm whitespace-pre-wrap">
            {selectedCircular.content}
          </div>
        </div>

        <CreateCircularSheet
          open={createOpen}
          onOpenChange={open => { setCreateOpen(open); if (!open) setEditCircular(null) }}
          onSuccess={() => {
            fetchCirculars()
            setSelectedCircular(null)
          }}
          editCircular={editCircular}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Circulars</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage school circulars and announcements
          </p>
        </div>
        <Button onClick={() => { setEditCircular(null); setCreateOpen(true) }} className="min-h-[44px] gap-2">
          <Plus className="h-4 w-4" />
          New Circular
        </Button>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex gap-1 border-b w-full sm:w-auto">
          {TABS.map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors min-h-[44px]
                ${tab === t.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 min-h-[44px]"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filteredCirculars.length === 0 ? (
        <div className="rounded-xl border bg-card flex flex-col items-center justify-center py-16 gap-3">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Megaphone className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-medium">No circulars found</p>
          <p className="text-sm text-muted-foreground">
            {search ? 'Try a different search term' : 'Create a circular to get started'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCirculars.map(c => (
            <CircularCard key={c.id} circular={c} onClick={handleCardClick} />
          ))}
        </div>
      )}

      <CreateCircularSheet
        open={createOpen}
        onOpenChange={open => { setCreateOpen(open); if (!open) setEditCircular(null) }}
        onSuccess={fetchCirculars}
        editCircular={editCircular}
      />
    </div>
  )
}
