'use client'

import { useState, useEffect, useCallback } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { Plus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import type { SectionData } from '../../types'

interface SectionsTabProps {
  classYearId: string
  onViewStudents?: (sectionId: string) => void
}

export function SectionsTab({ classYearId, onViewStudents }: SectionsTabProps) {
  const { apiParam } = useInstitutionId()
  const [sections, setSections] = useState<SectionData[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)

  const fetchSections = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/school/classes/${classYearId}/sections${apiParam}`)
      if (res.ok) setSections((await res.json()) as SectionData[])
    } catch { /* empty */ }
    setLoading(false)
  }, [classYearId])

  useEffect(() => { fetchSections() }, [fetchSections])

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {sections.length} section{sections.length !== 1 ? 's' : ''}
        </p>
        <Button size="sm" className="min-h-[44px]"
          onClick={() => setSheetOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Section
        </Button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : sections.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
          No sections yet. Add one to get started.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((s) => (
            <SectionCard key={s.id} section={s} onViewStudents={onViewStudents} />
          ))}
        </div>
      )}

      <AddSectionSheet open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        classYearId={classYearId}
        onCreated={fetchSections} />
    </div>
  )
}

function SectionCard({ section, onViewStudents }: {
  section: SectionData
  onViewStudents?: (sectionId: string) => void
}) {
  return (
    <button type="button"
      onClick={() => onViewStudents?.(section.id)}
      className="rounded-xl border bg-card p-4 space-y-2 text-left w-full
        hover:shadow-sm hover:border-primary/30 transition-all cursor-pointer">
      <p className="font-semibold text-base">{section.name}</p>
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {section._count.students} students
        </span>
        {section.maxStrength != null && (
          <span>/ {section.maxStrength} max</span>
        )}
      </div>
    </button>
  )
}

function AddSectionSheet({ open, onClose, classYearId, onCreated }: {
  open: boolean
  onClose: () => void
  classYearId: string
  onCreated: () => void
}) {
  const { toast } = useToast()
  const { apiParam } = useInstitutionId()
  const [name, setName] = useState('')
  const [maxStrength, setMaxStrength] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/school/classes/${classYearId}/sections${apiParam}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          maxStrength: maxStrength ? Number(maxStrength) : undefined,
        }),
      })
      if (res.ok) {
        toast({ title: 'Section added' })
        setName(''); setMaxStrength('')
        onCreated(); onClose()
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
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Add Section</SheetTitle>
          <SheetDescription>Create a new section for this class.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
          <div className="space-y-2">
            <Label htmlFor="sec-name">Section Name</Label>
            <Input id="sec-name" placeholder="e.g. Section A"
              value={name} onChange={(e) => setName(e.target.value)}
              required className="min-h-[44px]" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sec-max">Max Strength (optional)</Label>
            <Input id="sec-max" type="number" min={1}
              value={maxStrength} onChange={(e) => setMaxStrength(e.target.value)}
              className="min-h-[44px]" />
          </div>
          <Button type="submit" className="w-full min-h-[44px]" disabled={saving}>
            {saving ? 'Adding...' : 'Add Section'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
