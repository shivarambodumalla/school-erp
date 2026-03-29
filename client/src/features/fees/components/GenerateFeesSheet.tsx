'use client'

import { useState, useEffect } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import type { FeeCategory } from '../types'

interface Props {
  open: boolean
  onClose: () => void
  onGenerated: () => void
}

export function GenerateFeesSheet({ open, onClose, onGenerated }: Props) {
  const { apiParam, addParams } = useInstitutionId()
  const [categories, setCategories] = useState<FeeCategory[]>([])
  const [categoryId, setCategoryId] = useState('')
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    const sp = new URLSearchParams()
    addParams(sp)
    fetch(`/api/school/fees/categories?${sp}`)
      .then(r => r.ok ? r.json() : [])
      .then(d => setCategories(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [open, addParams])

  const handleGenerate = async () => {
    if (!categoryId || !dueDate) { toast.error('Select category and due date'); return }
    setSaving(true)
    try {
      const res = await fetch(`/api/school/fees/generate${apiParam}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feeCategoryId: categoryId, month, year, dueDate }),
      })
      if (!res.ok) { toast.error('Generation failed'); return }
      const data = await res.json() as { generated: number; skipped: number }
      toast.success(`Generated ${data.generated} fee records (${data.skipped} skipped)`)
      onGenerated()
      onClose()
    } catch { toast.error('Failed to generate') }
    finally { setSaving(false) }
  }

  return (
    <Sheet open={open} onOpenChange={() => onClose()}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader><SheetTitle>Generate Fee Records</SheetTitle></SheetHeader>
        <div className="mt-6 space-y-4">
          <div>
            <Label>Fee Category *</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="min-h-[44px] mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} — ₹{Number(c.amount).toLocaleString('en-IN')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Month</Label>
              <Input type="number" min={1} max={12} value={month}
                onChange={e => setMonth(Number(e.target.value))} className="min-h-[44px] mt-1" />
            </div>
            <div>
              <Label>Year</Label>
              <Input type="number" value={year}
                onChange={e => setYear(Number(e.target.value))} className="min-h-[44px] mt-1" />
            </div>
          </div>
          <div>
            <Label>Due Date *</Label>
            <Input type="date" value={dueDate}
              onChange={e => setDueDate(e.target.value)} className="min-h-[44px] mt-1" />
          </div>
          <Button onClick={handleGenerate} disabled={saving} className="w-full min-h-[44px]">
            {saving ? 'Generating...' : 'Generate Fees'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}