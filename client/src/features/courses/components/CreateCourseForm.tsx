'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface Props {
  onClose: () => void
  onCreated: () => void
}

export function CreateCourseForm({ onClose, onCreated }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim()) return
    setSaving(true)
    const res = await fetch('/api/school/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description: description || undefined }),
    })
    if (res.ok) onCreated()
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center
      bg-black/50 p-4">
      <div className="bg-background rounded-xl border p-6 w-full
        max-w-md space-y-4">
        <h2 className="text-lg font-bold">Create Course</h2>
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Course title"
            className="min-h-[44px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="desc">Description (optional)</Label>
          <Textarea
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description"
            rows={3}
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose} className="min-h-[44px]">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || saving}
            className="min-h-[44px]"
          >
            {saving ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </div>
    </div>
  )
}
