'use client'

import { useState } from 'react'
import { Lock, CalendarClock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface CounsellorNoteItem {
  id: string; note: string; followUpDate: string | null; createdAt: string
}

interface Props {
  notes: CounsellorNoteItem[]
  studentId: string
  onRefresh: () => void
}

export function CounsellorNotesSection({ notes, studentId, onRefresh }: Props) {
  const [noteText, setNoteText] = useState('')
  const [followUp, setFollowUp] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!noteText.trim()) return
    setSaving(true)
    const res = await fetch(`/api/school/students/${studentId}/counsellor-notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        note: noteText,
        followUpDate: followUp || undefined,
      }),
    })
    setSaving(false)
    if (res.ok) {
      toast.success('Note saved')
      setNoteText('')
      setFollowUp('')
      onRefresh()
    } else {
      const d = await res.json()
      toast.error(d.error ?? 'Failed')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold">Counsellor Notes</h3>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100
          text-amber-700 flex items-center gap-0.5">
          <Lock className="h-2.5 w-2.5" /> Private
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        Not visible to teachers or parents
      </p>

      {notes.length === 0 ? (
        <div className="rounded-xl border bg-muted/30 p-6 text-center">
          <p className="text-sm text-muted-foreground">No notes recorded</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map(n => (
            <div key={n.id} className="rounded-lg border p-3 space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>
                  {new Date(n.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </span>
                {n.followUpDate && (
                  <span className="flex items-center gap-0.5 text-primary">
                    <CalendarClock className="h-3 w-3" />
                    Follow-up: {new Date(n.followUpDate).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short',
                    })}
                  </span>
                )}
              </div>
              <p className="text-sm">{n.note}</p>
            </div>
          ))}
        </div>
      )}

      {/* Inline add form */}
      <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
        <div className="space-y-1">
          <Label>Add Note</Label>
          <textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            rows={3}
            placeholder="Write a counsellor note..."
            className="w-full rounded-md border border-input bg-background
              px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1
              focus:ring-primary"
          />
        </div>
        <div className="flex items-end gap-3">
          <div className="space-y-1">
            <Label>Follow-up Date</Label>
            <Input type="date" value={followUp}
              onChange={e => setFollowUp(e.target.value)}
              className="min-h-[44px]" />
          </div>
          <Button size="sm" className="min-h-[44px]"
            onClick={handleAdd} disabled={!noteText.trim() || saving}>
            {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            Save Note
          </Button>
        </div>
      </div>
    </div>
  )
}
