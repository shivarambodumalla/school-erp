'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface CourseData {
  id: string
  title: string
  description: string | null
  status: string
  targetType: string
  maxEnrollment: number | null
}

interface Props {
  course: CourseData
}

export function CourseSettingsTab({ course }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(course.title)
  const [description, setDescription] = useState(course.description ?? '')
  const [status, setStatus] = useState(course.status)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/school/courses/${course.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: description || null, status }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Settings saved')
      router.refresh()
    } catch {
      toast.error('Failed to save settings')
    }
    setSaving(false)
  }

  return (
    <div className="space-y-4 max-w-lg">
      <h2 className="text-lg font-semibold">Settings</h2>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="min-h-[44px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="desc">Description</Label>
        <Textarea
          id="desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <div className="flex gap-2">
          {['DRAFT', 'ACTIVE', 'ARCHIVED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium
                min-h-[44px] transition-colors
                ${status === s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={!title.trim() || saving}
        className="min-h-[44px]"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  )
}
