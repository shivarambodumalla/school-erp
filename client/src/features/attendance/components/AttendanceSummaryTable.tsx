'use client'

import { useCallback, useEffect, useState } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { Label } from '@/components/ui/label'
import type { SectionOption, SummaryStudent } from '../types'

interface Props {
  sections: SectionOption[]
}

export function AttendanceSummaryTable({ sections }: Props) {
  const { addParams } = useInstitutionId()
  const now = new Date()
  const [sectionId, setSectionId] = useState(sections[0]?.id ?? '')
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [students, setStudents] = useState<SummaryStudent[]>([])
  const [loading, setLoading] = useState(false)

  const fetchSummary = useCallback(async () => {
    if (!sectionId) return
    setLoading(true)
    try {
      const params = new URLSearchParams({
        sectionId,
        month: String(month),
        year: String(year),
      })
      addParams(params)
      const res = await fetch(
        `/api/school/attendance/summary?${params}`,
      )
      if (res.ok) {
        const data = await res.json()
        setStudents(data.summary ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [sectionId, month, year])

  useEffect(() => { fetchSummary() }, [fetchSummary])

  const rowColor = (pct: number) => {
    if (pct < 75) return 'bg-red-50 dark:bg-red-950/20'
    if (pct < 85) return 'bg-amber-50 dark:bg-amber-950/20'
    return ''
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex flex-wrap gap-3 items-end">
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
        <div className="space-y-1">
          <Label>Month</Label>
          <select
            className="rounded-md border px-3 py-2 text-sm
              min-h-[44px]"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2024, i).toLocaleString('default', {
                  month: 'long',
                })}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label>Year</Label>
          <select
            className="rounded-md border px-3 py-2 text-sm
              min-h-[44px]"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[year - 1, year, year + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="h-8 w-8 animate-spin rounded-full
            border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">
                  Roll
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  Student
                </th>
                <th className="px-3 py-3 text-center font-medium">
                  Present
                </th>
                <th className="px-3 py-3 text-center font-medium">
                  Absent
                </th>
                <th className="px-3 py-3 text-center font-medium">
                  Late
                </th>
                <th className="px-3 py-3 text-center font-medium">
                  Total
                </th>
                <th className="px-3 py-3 text-center font-medium">
                  %
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr
                  key={s.studentId}
                  className={`border-b last:border-0
                    ${rowColor(s.percentage)}`}
                >
                  <td className="px-4 py-2">
                    {s.rollNo ?? '\u2014'}
                  </td>
                  <td className="px-4 py-2 font-medium">
                    {s.firstName} {s.lastName}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {s.PRESENT}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {s.ABSENT}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {s.LATE}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {s.total}
                  </td>
                  <td className="px-3 py-2 text-center font-medium">
                    {s.percentage}%
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center
                      text-muted-foreground"
                  >
                    No attendance data for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
