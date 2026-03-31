'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'

interface Props {
  open: boolean
  onClose: () => void
  deptId: string
  onPosted: () => void
}

export function PostAnnouncementSheet({ open, onClose, deptId, onPosted }: Props) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/school/departments/${deptId}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content: content.trim() }),
      })
      if (res.ok) {
        toast.success('Announcement posted')
        setTitle(''); setContent('')
        onClose(); onPosted()
      } else {
        const err = (await res.json()) as { error: string }
        toast.error(err.error)
      }
    } catch { toast.error('Failed to post announcement') }
    setSubmitting(false)
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Post Announcement</SheetTitle>
          <SheetDescription>Share an update with the department</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Announcement title" />
          </div>
          <div className="space-y-1.5">
            <Label>Content *</Label>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)}
              placeholder="Write your announcement..." rows={6} />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="min-h-[44px]">Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting} className="min-h-[44px]">
            {submitting ? 'Posting...' : 'Post Announcement'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
