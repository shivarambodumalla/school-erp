'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  subjectId: string
  itemId: string
}

export function NotebookPanel({
  open,
  onOpenChange,
  subjectId,
  itemId,
}: Props) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null
  )
  const contentRef = useRef(content)
  contentRef.current = content

  // Fetch existing note
  const fetchNote = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/school/subjects/${subjectId}/items/${itemId}/notes`
      )
      if (res.ok) {
        const data = (await res.json()) as {
          note: { content: string } | null
        }
        setContent(data.note?.content ?? '')
      }
    } catch {
      // Start with empty
    } finally {
      setLoading(false)
    }
  }, [subjectId, itemId])

  useEffect(() => {
    if (open) {
      fetchNote()
    }
  }, [open, fetchNote])

  // Auto-save with debounce
  const saveNote = useCallback(async () => {
    setSaving(true)
    try {
      await fetch(
        `/api/school/subjects/${subjectId}/items/${itemId}/notes`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: contentRef.current,
          }),
        }
      )
      setLastSaved(new Date())
    } catch {
      toast.error('Failed to save note')
    } finally {
      setSaving(false)
    }
  }, [subjectId, itemId])

  const handleChange = (value: string) => {
    setContent(value)
    // Debounced auto-save (2 seconds after last keystroke)
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current)
    }
    autoSaveTimer.current = setTimeout(() => {
      saveNote()
    }, 2000)
  }

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
    }
  }, [])

  // Save on close
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && content.trim()) {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
      saveNote()
    }
    onOpenChange(isOpen)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col"
      >
        <SheetHeader>
          <SheetTitle>Notes</SheetTitle>
          <SheetDescription>
            Your private notes for this item. Auto-saved as
            you type.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 mt-4 flex flex-col gap-3">
          {loading ? (
            <div className="flex items-center justify-center flex-1">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <Textarea
                value={content}
                onChange={(e) =>
                  handleChange(e.target.value)
                }
                placeholder="Write your notes here..."
                className="flex-1 min-h-[200px] resize-none font-mono text-sm"
              />

              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {saving ? (
                    <span className="inline-flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Saving...
                    </span>
                  ) : lastSaved ? (
                    `Last saved ${lastSaved.toLocaleTimeString()}`
                  ) : (
                    'Auto-saves as you type'
                  )}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveNote}
                  disabled={saving}
                  className="h-8 gap-1"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
