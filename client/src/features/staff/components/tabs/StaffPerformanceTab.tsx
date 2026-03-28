'use client'

import { useState, useEffect, useCallback } from 'react'
import { Star, ClipboardList } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { PerformanceNoteItem } from '../../types'

export function StaffPerformanceTab({ staffId }: { staffId: string }) {
  const [notes, setNotes] = useState<PerformanceNoteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [noteText, setNoteText] = useState('')
  const [rating, setRating] = useState(0)
  const [saving, setSaving] = useState(false)

  const fetchNotes = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/school/staff/${staffId}/performance-notes`)
    if (res.ok) {
      const data = (await res.json()) as { notes: PerformanceNoteItem[] }
      setNotes(data.notes)
    }
    setLoading(false)
  }, [staffId])

  useEffect(() => { fetchNotes() }, [fetchNotes])

  const addNote = async () => {
    if (!noteText.trim()) return
    setSaving(true)
    const res = await fetch(`/api/school/staff/${staffId}/performance-notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        note: noteText,
        rating: rating || undefined,
      }),
    })
    setSaving(false)
    if (res.ok) {
      toast.success('Note added')
      setNoteText('')
      setRating(0)
      fetchNotes()
    }
  }

  return (
    <div className="space-y-6 pt-4">
      {/* Add Note Form */}
      <div className="rounded-xl border p-4 space-y-3">
        <h3 className="font-semibold">Add Performance Note</h3>
        <div>
          <Label>Rating</Label>
          <div className="flex gap-1 mt-1">
            {[1, 2, 3, 4, 5].map(i => (
              <button key={i} type="button" onClick={() => setRating(i)}
                className="p-1 min-h-[44px] min-w-[44px] flex items-center justify-center">
                <Star className={`h-5 w-5 ${
                  i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                }`} />
              </button>
            ))}
            {rating > 0 && (
              <button type="button" onClick={() => setRating(0)}
                className="text-xs text-muted-foreground ml-2 min-h-[44px]">
                Clear
              </button>
            )}
          </div>
        </div>
        <Textarea value={noteText} onChange={e => setNoteText(e.target.value)}
          placeholder="Write a note..." rows={3} />
        <Button onClick={addNote} disabled={saving || !noteText.trim()}
          className="min-h-[44px]">
          {saving ? 'Saving...' : 'Add Note'}
        </Button>
      </div>

      {/* Notes List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="rounded-xl border p-8 text-center text-muted-foreground">
          <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No performance notes yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map(n => (
            <div key={n.id} className="rounded-xl border p-4">
              {n.rating && (
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${
                      i < n.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                    }`} />
                  ))}
                </div>
              )}
              <p className="text-sm">{n.note}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(n.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
