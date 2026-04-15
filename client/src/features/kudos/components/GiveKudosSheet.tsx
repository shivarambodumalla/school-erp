'use client'

import { useState } from 'react'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { KudosBadgeIcon, ALL_BADGES, getBadgeLabel, getBadgePoints } from './KudosBadgeIcon'
import { useToast } from '@/hooks/use-toast'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentId: string
  studentName: string
  onSuccess: () => void
}

export function GiveKudosSheet({ open, onOpenChange, studentId, studentName, onSuccess }: Props) {
  const [selectedBadge, setSelectedBadge] = useState<string>('STAR')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({ title: 'Title is required', variant: 'destructive' })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/school/kudos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          badgeType: selectedBadge,
          title: title.trim(),
          description: description.trim() || undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json() as { error?: string }
        throw new Error(err.error ?? 'Failed to give kudos')
      }
      toast({ title: 'Kudos sent!' })
      setTitle('')
      setDescription('')
      setSelectedBadge('STAR')
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[340px] sm:w-[400px] p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-3 border-b">
          <SheetTitle className="text-base">Give Kudos</SheetTitle>
          <SheetDescription>
            Recognise {studentName} with a badge
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Badge selector */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Choose a Badge</Label>
            <div className="grid grid-cols-3 gap-3">
              {ALL_BADGES.map(badge => (
                <button
                  key={badge}
                  type="button"
                  onClick={() => setSelectedBadge(badge)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-colors min-h-[44px]
                    ${selectedBadge === badge
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent bg-muted/30 hover:bg-muted/50'
                    }`}
                >
                  <KudosBadgeIcon badge={badge} size="md" />
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {getBadgeLabel(badge)}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Points: <span className="font-semibold text-primary">{getBadgePoints(selectedBadge)}</span>
            </p>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="kudos-title" className="text-sm font-medium">Title</Label>
            <Input
              id="kudos-title"
              placeholder="e.g. Excellent homework"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="min-h-[44px]"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="kudos-desc" className="text-sm font-medium">
              Description <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="kudos-desc"
              placeholder="Add more detail..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t">
          <Button
            onClick={handleSubmit}
            disabled={submitting || !title.trim()}
            className="w-full min-h-[44px]"
          >
            {submitting ? 'Sending...' : 'Give Kudos'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
