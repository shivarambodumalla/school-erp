'use client'

import { useState } from 'react'
import { Trophy, Plus, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface AchievementItem {
  id: string; category: string; title: string
  description: string | null; date: string
  photoUrl: string | null; createdAt: string
}

interface Props {
  achievements: AchievementItem[]
  studentId: string
  isAdmin: boolean
  onRefresh: () => void
}

const CAT_COLORS: Record<string, string> = {
  SPORTS: 'bg-blue-100 text-blue-700',
  CULTURAL: 'bg-purple-100 text-purple-700',
  ACADEMIC: 'bg-amber-100 text-amber-700',
  COMMUNITY: 'bg-green-100 text-green-700',
  OTHER: 'bg-muted text-muted-foreground',
}

const CATEGORIES = ['SPORTS', 'CULTURAL', 'ACADEMIC', 'COMMUNITY', 'OTHER']

export function AchievementsSection({ achievements, studentId, isAdmin, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Achievements</h3>
        {isAdmin && (
          <Button size="sm" variant="outline" className="min-h-[44px]"
            onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        )}
      </div>

      {achievements.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground
          rounded-xl border bg-muted/30">
          <Trophy className="h-8 w-8" />
          <p className="text-sm">No achievements recorded</p>
        </div>
      ) : (
        <div className="space-y-2">
          {achievements.map(a => (
            <div key={a.id} className="rounded-lg border p-3 flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded
                    ${CAT_COLORS[a.category] ?? CAT_COLORS.OTHER}`}>
                    {a.category}
                  </span>
                  <span className="text-sm font-medium">{a.title}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{new Date(a.date).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}</span>
                </div>
                {a.description && (
                  <p className="text-xs text-muted-foreground mt-1">{a.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <AddAchievementForm
          studentId={studentId}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); onRefresh() }}
        />
      )}
    </div>
  )
}

function AddAchievementForm({ studentId, onClose, onSaved }: {
  studentId: string; onClose: () => void; onSaved: () => void
}) {
  const [category, setCategory] = useState('ACADEMIC')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit() {
    if (!title || !date) return
    setSaving(true)
    const res = await fetch(`/api/school/students/${studentId}/achievements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, title, description: description || undefined, date }),
    })
    setSaving(false)
    if (res.ok) { toast.success('Achievement added'); onSaved() }
    else { const d = await res.json(); toast.error(d.error ?? 'Failed') }
  }

  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Add Achievement</span>
        <button onClick={onClose} className="p-1 rounded hover:bg-muted">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label>Category</Label>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <Label>Title *</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} className="min-h-[44px]" />
        </div>
        <div className="space-y-1">
          <Label>Date *</Label>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="min-h-[44px]" />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Description</Label>
        <textarea value={description} onChange={e => setDescription(e.target.value)}
          rows={2} className="w-full rounded-md border border-input bg-background
            px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>
      <Button size="sm" onClick={handleSubmit} disabled={!title || !date || saving}>
        {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Save
      </Button>
    </div>
  )
}
