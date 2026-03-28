'use client'

import { useState } from 'react'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ExamTypeRow, StudentGradeRow } from '../types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  subjectId: string
  examTypes: ExamTypeRow[]
  students: StudentGradeRow[]
  onSaved: () => void
}

export function BulkEntrySheet({
  open, onOpenChange, subjectId,
  examTypes, students, onSaved,
}: Props) {
  const [examTypeId, setExamTypeId] = useState(
    examTypes[0]?.id ?? '',
  )
  const [totalMarks, setTotalMarks] = useState(100)
  const [entries, setEntries] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)

  const updateEntry = (studentId: string, val: number) => {
    setEntries((prev) => ({ ...prev, [studentId]: val }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        examTypeId,
        totalMarks,
        entries: Object.entries(entries)
          .filter(([, v]) => v >= 0)
          .map(([studentId, marksObtained]) => ({
            studentId,
            marksObtained,
          })),
      }
      const res = await fetch(
        `/api/school/subjects/${subjectId}/gradebook/bulk`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )
      if (res.ok) {
        onOpenChange(false)
        onSaved()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Bulk Grade Entry</SheetTitle>
          <SheetDescription>
            Enter marks for all students at once.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div className="space-y-1">
            <Label>Exam Type</Label>
            <select
              className="w-full rounded-md border px-3 py-2
                text-sm min-h-[44px]"
              value={examTypeId}
              onChange={(e) => setExamTypeId(e.target.value)}
            >
              {examTypes.map((et) => (
                <option key={et.id} value={et.id}>
                  {et.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label>Total Marks</Label>
            <Input
              type="number"
              min={1}
              value={totalMarks}
              onChange={(e) => setTotalMarks(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            {students.map((s) => (
              <div
                key={s.studentId}
                className="flex items-center gap-3"
              >
                <span className="w-40 truncate text-sm">
                  {s.rollNo && `#${s.rollNo} `}
                  {s.firstName} {s.lastName}
                </span>
                <Input
                  type="number"
                  min={0}
                  max={totalMarks}
                  placeholder="Marks"
                  className="w-24"
                  onChange={(e) =>
                    updateEntry(s.studentId, Number(e.target.value))
                  }
                />
              </div>
            ))}
          </div>

          <Button
            className="w-full min-h-[44px]"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save All'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
