'use client'

import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'

interface AddClassSheetProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function AddClassSheet({ open, onClose, onCreated }: AddClassSheetProps) {
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [gradeLevel, setGradeLevel] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const reset = () => {
    setName('')
    setGradeLevel('')
    setDescription('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !gradeLevel) return

    setSaving(true)
    try {
      const res = await fetch('/api/school/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          gradeLevel: Number(gradeLevel),
          description: description.trim() || undefined,
        }),
      })

      if (res.ok) {
        toast({ title: 'Class created', description: `${name} has been added.` })
        reset()
        onCreated()
        onClose()
      } else {
        const err = (await res.json()) as { error: string }
        toast({ title: 'Error', description: err.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' })
    }
    setSaving(false)
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Class</SheetTitle>
          <SheetDescription>Create a new class template.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
          <div className="space-y-2">
            <Label htmlFor="class-name">Class Name</Label>
            <Input id="class-name" placeholder="e.g. Class 8"
              value={name} onChange={(e) => setName(e.target.value)}
              required className="min-h-[44px]" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade-level">Grade Level</Label>
            <Input id="grade-level" type="number" min={1} max={12}
              placeholder="1-12" value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              required className="min-h-[44px]" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="class-desc">Description (optional)</Label>
            <Textarea id="class-desc" placeholder="Brief description..."
              value={description} onChange={(e) => setDescription(e.target.value)}
              rows={3} />
          </div>

          <Button type="submit" className="w-full min-h-[44px]" disabled={saving}>
            {saving ? 'Creating...' : 'Create Class'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
