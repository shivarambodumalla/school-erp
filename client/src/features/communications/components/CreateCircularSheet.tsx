'use client'

import { useState, useEffect } from 'react'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import type { CircularItem } from './CircularCard'

interface ClassOption {
  id: string
  name: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editCircular?: CircularItem | null
}

export function CreateCircularSheet({ open, onOpenChange, onSuccess, editCircular }: Props) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [audience, setAudience] = useState('ALL')
  const [targetClassIds, setTargetClassIds] = useState<string[]>([])
  const [isPinned, setIsPinned] = useState(false)
  const [publishDate, setPublishDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [classes, setClasses] = useState<ClassOption[]>([])
  const { toast } = useToast()

  const isEditing = !!editCircular

  // Populate form when editing
  useEffect(() => {
    if (editCircular) {
      setTitle(editCircular.title)
      setContent(editCircular.content)
      setAudience(editCircular.targetAudience)
      setIsPinned(editCircular.isPinned)
      if (editCircular.publishedAt) {
        setPublishDate(editCircular.publishedAt.substring(0, 10))
      }
      if (editCircular.expiresAt) {
        setExpiryDate(editCircular.expiresAt.substring(0, 10))
      }
    } else {
      setTitle('')
      setContent('')
      setAudience('ALL')
      setTargetClassIds([])
      setIsPinned(false)
      setPublishDate('')
      setExpiryDate('')
    }
  }, [editCircular, open])

  // Fetch classes if audience is CLASS
  useEffect(() => {
    if (audience !== 'CLASS') return
    fetch('/api/school/academic')
      .then(r => r.ok ? r.json() : null)
      .then((data: { classes?: ClassOption[] } | null) => {
        if (data?.classes) setClasses(data.classes)
      })
      .catch(() => { /* ignore */ })
  }, [audience])

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast({ title: 'Title and content are required', variant: 'destructive' })
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        targetAudience: audience,
        targetClassIds: audience === 'CLASS' ? targetClassIds : [],
        isPinned,
        publishedAt: publishDate || new Date().toISOString(),
        expiresAt: expiryDate || undefined,
      }

      const url = isEditing
        ? `/api/school/circulars/${editCircular.id}`
        : '/api/school/circulars'
      const method = isEditing ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json() as { error?: string }
        throw new Error(err.error ?? 'Failed to save circular')
      }

      toast({ title: isEditing ? 'Circular updated' : 'Circular published' })
      onOpenChange(false)
      onSuccess()
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const toggleClassId = (classId: string) => {
    setTargetClassIds(prev =>
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[340px] sm:w-[440px] p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-3 border-b">
          <SheetTitle className="text-base">
            {isEditing ? 'Edit Circular' : 'New Circular'}
          </SheetTitle>
          <SheetDescription>
            {isEditing ? 'Update circular details' : 'Create and publish a circular'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="circ-title" className="text-sm font-medium">Title</Label>
            <Input
              id="circ-title"
              placeholder="Circular title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="min-h-[44px]"
              maxLength={200}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="circ-content" className="text-sm font-medium">Content</Label>
            <Textarea
              id="circ-content"
              placeholder="Write circular content..."
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={6}
            />
          </div>

          {/* Target audience */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Target Audience</Label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger className="min-h-[44px]">
                <SelectValue placeholder="Select audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="STUDENTS">Students</SelectItem>
                <SelectItem value="PARENTS">Parents</SelectItem>
                <SelectItem value="STAFF">Staff</SelectItem>
                <SelectItem value="CLASS">Specific Classes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Class multi-select when CLASS audience */}
          {audience === 'CLASS' && classes.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Select Classes</Label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {classes.map(cls => (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => toggleClassId(cls.id)}
                    className={`text-left px-3 py-2 rounded-lg text-sm transition-colors min-h-[44px]
                      ${targetClassIds.includes(cls.id)
                        ? 'bg-primary/10 text-primary font-medium border border-primary/30'
                        : 'bg-muted/30 hover:bg-muted/50 border border-transparent'
                      }`}
                  >
                    {cls.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pinned toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="circ-pinned" className="text-sm font-medium">Pin to top</Label>
            <Switch
              id="circ-pinned"
              checked={isPinned}
              onCheckedChange={setIsPinned}
            />
          </div>

          {/* Publish date */}
          <div className="space-y-2">
            <Label htmlFor="circ-pub-date" className="text-sm font-medium">
              Publish Date <span className="text-muted-foreground font-normal">(defaults to now)</span>
            </Label>
            <Input
              id="circ-pub-date"
              type="date"
              value={publishDate}
              onChange={e => setPublishDate(e.target.value)}
              className="min-h-[44px]"
            />
          </div>

          {/* Expiry date */}
          <div className="space-y-2">
            <Label htmlFor="circ-exp-date" className="text-sm font-medium">
              Expiry Date <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="circ-exp-date"
              type="date"
              value={expiryDate}
              onChange={e => setExpiryDate(e.target.value)}
              className="min-h-[44px]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t">
          <Button
            onClick={handleSubmit}
            disabled={submitting || !title.trim() || !content.trim()}
            className="w-full min-h-[44px]"
          >
            {submitting ? 'Saving...' : isEditing ? 'Update Circular' : 'Publish Circular'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
