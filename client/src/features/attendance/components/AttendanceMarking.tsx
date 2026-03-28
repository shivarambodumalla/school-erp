'use client'

import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type {
  SectionOption, AttendanceMode,
  AttendanceStudent, AttendanceStatus,
} from '../types'

interface Props {
  sections: SectionOption[]
  mode: AttendanceMode
}

const STATUS_OPTIONS: {
  value: AttendanceStatus; label: string; color: string
}[] = [
  { value: 'PRESENT', label: 'P', color: 'bg-green-500 text-white' },
  { value: 'ABSENT', label: 'A', color: 'bg-red-500 text-white' },
  { value: 'LATE', label: 'L', color: 'bg-amber-500 text-white' },
  { value: 'HALF_DAY', label: 'H', color: 'bg-blue-500 text-white' },
  { value: 'EXCUSED', label: 'E', color: 'bg-gray-400 text-white' },
]

export function AttendanceMarking({ sections, mode }: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const [date, setDate] = useState(today)
  const [sectionId, setSectionId] = useState(sections[0]?.id ?? '')
  const [period, setPeriod] = useState<number | undefined>(undefined)
  const [students, setStudents] = useState<AttendanceStudent[]>([])
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadStudents = useCallback(async () => {
    const params = new URLSearchParams({ sectionId, date })
    if (mode !== 'DAILY' && period) {
      params.set('periodNumber', String(period))
    }
    const res = await fetch(`/api/school/attendance?${params}`)
    if (res.ok) {
      const data = await res.json()
      setStudents(data.students)
      setLoaded(true)
    }
  }, [sectionId, date, mode, period])

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.studentId === studentId ? { ...s, status } : s,
      ),
    )
  }

  const markAll = (status: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((s) => ({ ...s, status })),
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const records = students
        .filter((s) => s.status !== null)
        .map((s) => ({
          studentId: s.studentId,
          status: s.status!,
          notes: s.notes ?? undefined,
        }))

      await fetch('/api/school/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId,
          date,
          periodNumber: mode !== 'DAILY' ? period : undefined,
          records,
        }),
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1">
          <Label>Date</Label>
          <Input
            type="date"
            value={date}
            max={today}
            className="min-h-[44px]"
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Section</Label>
          <select
            className="rounded-md border px-3 py-2 text-sm
              min-h-[44px]"
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
          >
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.className} - {s.name}
              </option>
            ))}
          </select>
        </div>
        {mode !== 'DAILY' && (
          <div className="space-y-1">
            <Label>Period</Label>
            <Input
              type="number"
              min={1}
              max={10}
              className="w-20 min-h-[44px]"
              value={period ?? ''}
              onChange={(e) => setPeriod(Number(e.target.value))}
            />
          </div>
        )}
        <Button
          className="min-h-[44px]"
          onClick={loadStudents}
        >
          Load
        </Button>
      </div>

      {loaded && students.length > 0 && (
        <>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="min-h-[44px]"
              onClick={() => markAll('PRESENT')}
            >
              Mark All Present
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="min-h-[44px]"
              onClick={() => markAll('ABSENT')}
            >
              Mark All Absent
            </Button>
          </div>

          <div className="rounded-xl border bg-card divide-y">
            {students.map((s) => (
              <div
                key={s.studentId}
                className="flex items-center gap-3 px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {s.firstName} {s.lastName}
                  </p>
                  {s.rollNo && (
                    <p className="text-xs text-muted-foreground">
                      #{s.rollNo}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      className={`min-h-[44px] min-w-[44px]
                        rounded-lg text-sm font-bold
                        transition-colors ${
                        s.status === opt.value
                          ? opt.color
                          : 'bg-muted text-muted-foreground'
                      }`}
                      onClick={() =>
                        setStatus(s.studentId, opt.value)
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Button
            className="w-full min-h-[44px]"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Attendance'}
          </Button>
        </>
      )}

      {loaded && students.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          No students found in this section.
        </p>
      )}
    </div>
  )
}
