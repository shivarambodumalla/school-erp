'use client'

import { useState } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { GradeCellData } from '../types'

interface Props {
  cell: GradeCellData | null
  studentId: string
  examTypeId: string
  subjectId: string
  onSaved: () => void
}

export function GradeCell({
  cell, studentId, examTypeId, subjectId, onSaved,
}: Props) {
  const [open, setOpen] = useState(false)
  const [marks, setMarks] = useState(cell?.marksObtained ?? 0)
  const [total, setTotal] = useState(cell?.totalMarks ?? 100)
  const [include, setInclude] = useState(
    cell?.isIncludedInFinal ?? true,
  )
  const [notes, setNotes] = useState(cell?.notes ?? '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch(
        `/api/school/subjects/${subjectId}/gradebook/entry`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId,
            examTypeId,
            marksObtained: marks,
            totalMarks: total,
            isIncludedInFinal: include,
            notes: notes || undefined,
          }),
        },
      )
      setOpen(false)
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await fetch(
        `/api/school/subjects/${subjectId}/gradebook/entry`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId, examTypeId }),
        },
      )
      setOpen(false)
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="min-h-[44px] min-w-[60px] px-2 py-1
            rounded hover:bg-muted transition-colors text-center
            w-full"
        >
          {cell ? (
            <div>
              <span className="font-medium">
                {cell.marksObtained}/{cell.totalMarks}
              </span>
              {cell.gradeLetter && (
                <span className="block text-xs text-muted-foreground">
                  {cell.gradeLetter}
                </span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">&mdash;</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 space-y-3">
        <div className="space-y-1">
          <Label>Marks Obtained</Label>
          <Input
            type="number"
            min={0}
            max={total}
            value={marks}
            onChange={(e) => setMarks(Number(e.target.value))}
          />
        </div>
        <div className="space-y-1">
          <Label>Total Marks</Label>
          <Input
            type="number"
            min={1}
            value={total}
            onChange={(e) => setTotal(Number(e.target.value))}
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={include}
            onCheckedChange={setInclude}
          />
          <Label>Include in final</Label>
        </div>
        <div className="space-y-1">
          <Label>Notes</Label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional"
          />
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="min-h-[44px] flex-1"
            onClick={handleSave}
            disabled={saving}
          >
            Save
          </Button>
          {cell && (
            <Button
              size="sm"
              variant="destructive"
              className="min-h-[44px]"
              onClick={handleDelete}
              disabled={saving}
            >
              Delete
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
