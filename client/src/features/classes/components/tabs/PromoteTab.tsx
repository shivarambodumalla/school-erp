'use client'

import { useState, useEffect, useCallback } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { AlertTriangle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { PromoteStudent } from '../../types'

interface PromoteTabProps {
  classYearId: string
  gradeLevel: number
  academicYearName: string
}

type Decision = 'PROMOTED' | 'DETAINED'

interface NextClassInfo {
  id: string
  sections: { id: string; name: string }[]
  classTemplateName: string
}

export function PromoteTab({ classYearId, gradeLevel, academicYearName }: PromoteTabProps) {
  const { apiParam } = useInstitutionId()
  const [students, setStudents] = useState<PromoteStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [decisions, setDecisions] = useState<Record<string, Decision>>({})
  const [sectionChoices, setSectionChoices] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [nextClass, setNextClass] = useState<NextClassInfo | null>(null)
  const [nextClassLoading, setNextClassLoading] = useState(true)

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/school/classes/${classYearId}/promote${apiParam}`)
      if (res.ok) {
        const data = (await res.json()) as PromoteStudent[]
        setStudents(data)
        const initial: Record<string, Decision> = {}
        data.forEach((s) => { initial[s.student.id] = 'PROMOTED' })
        setDecisions(initial)
      }
    } catch { /* empty */ }
    setLoading(false)
  }, [classYearId])

  // Fetch next class info (gradeLevel + 1)
  useEffect(() => {
    setNextClassLoading(true)
    fetch(`/api/school/classes${apiParam}`).then(async r => {
      if (!r.ok) { setNextClassLoading(false); return }
      const classes = await r.json() as { id: string; name: string; gradeLevel: number; activeYear: { id: string } | null }[]
      const nextGrade = classes.find(c => c.gradeLevel === gradeLevel + 1)
      if (nextGrade?.activeYear) {
        const detailRes = await fetch(`/api/school/classes/${nextGrade.activeYear.id}${apiParam}`)
        if (detailRes.ok) {
          const detail = await detailRes.json()
          setNextClass({
            id: nextGrade.activeYear.id,
            classTemplateName: nextGrade.name,
            sections: (detail.sections ?? []).map((s: { id: string; name: string }) => ({ id: s.id, name: s.name })),
          })
        }
      }
      setNextClassLoading(false)
    }).catch(() => setNextClassLoading(false))
  }, [gradeLevel])

  useEffect(() => { fetchStudents() }, [fetchStudents])

  const setDecision = (studentId: string, d: Decision) => {
    setDecisions((prev) => ({ ...prev, [studentId]: d }))
  }

  const setSectionForStudent = (studentId: string, sectionId: string) => {
    setSectionChoices(prev => ({ ...prev, [studentId]: sectionId }))
  }

  const promotedCount = Object.values(decisions).filter(d => d === 'PROMOTED').length
  const detainedCount = Object.values(decisions).filter(d => d === 'DETAINED').length

  const handleConfirm = async () => {
    if (!confirm(`Promote ${promotedCount} and detain ${detainedCount} students? This cannot be undone.`)) return
    const list = Object.entries(decisions).map(([studentId, status]) => ({
      studentId, status,
      ...(status === 'PROMOTED' && sectionChoices[studentId] ? { toSectionId: sectionChoices[studentId] } : {}),
    }))
    if (list.length === 0) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/school/classes/${classYearId}/promote${apiParam}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decisions: list }),
      })
      if (res.ok) {
        const data = await res.json() as { results: { success: boolean }[] }
        const successCount = data.results.filter(r => r.success).length
        toast.success(`${successCount} student${successCount !== 1 ? 's' : ''} processed`)
        fetchStudents()
      } else {
        const err = (await res.json()) as { error: string }
        toast.error(err.error)
      }
    } catch {
      toast.error('Something went wrong')
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="space-y-3 pt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground mt-4">
        No active students to promote.
      </div>
    )
  }

  return (
    <div className="space-y-4 pt-4">
      {/* Warning banner */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-semibold">This action is permanent</p>
          <p>Once confirmed, promotions and detentions cannot be undone. Review each student carefully.</p>
        </div>
      </div>

      {/* Next class info */}
      {nextClassLoading ? (
        <div className="h-12 rounded-lg bg-muted animate-pulse" />
      ) : nextClass ? (
        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold">Promoting to: {nextClass.classTemplateName} — {academicYearName}</p>
            <p>Sections available: {nextClass.sections.map(s => s.name).join(', ') || 'None'}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">
            <p className="font-semibold">Next class not found</p>
            <p>Grade {gradeLevel + 1} for {academicYearName} hasn&apos;t been created yet.
              Create it first before promoting students.</p>
          </div>
        </div>
      )}

      {/* Student list */}
      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="border-b">
              <th className="text-left px-4 py-3 font-medium">Student</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Section</th>
              <th className="text-center px-4 py-3 font-medium">Decision</th>
              {nextClass && nextClass.sections.length > 1 && (
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Target Section</th>
              )}
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.student.id} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <div>
                    <span className="font-medium">{s.student.firstName} {s.student.lastName}</span>
                    <span className="text-muted-foreground text-xs ml-2">{s.student.admissionNo}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{s.section.name}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-4">
                    <RadioOption label="Promote"
                      checked={decisions[s.student.id] === 'PROMOTED'}
                      onChange={() => setDecision(s.student.id, 'PROMOTED')} />
                    <RadioOption label="Detain"
                      checked={decisions[s.student.id] === 'DETAINED'}
                      onChange={() => setDecision(s.student.id, 'DETAINED')} />
                  </div>
                </td>
                {nextClass && nextClass.sections.length > 1 && (
                  <td className="px-4 py-3 hidden md:table-cell">
                    {decisions[s.student.id] === 'PROMOTED' ? (
                      <select
                        value={sectionChoices[s.student.id] ?? ''}
                        onChange={e => setSectionForStudent(s.student.id, e.target.value)}
                        className="h-9 rounded-md border border-input bg-background px-2 text-sm">
                        <option value="">Auto (first)</option>
                        {nextClass.sections.map(sec => (
                          <option key={sec.id} value={sec.id}>{sec.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Promoting {promotedCount}, Detaining {detainedCount}
        </p>
        <Button className="min-h-[44px]" disabled={submitting || (!nextClass && promotedCount > 0)}
          onClick={handleConfirm}>
          {submitting ? 'Processing...' : 'Confirm Promotions'}
        </Button>
      </div>
    </div>
  )
}

function RadioOption({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: () => void
}) {
  return (
    <label className="flex items-center gap-1.5 cursor-pointer min-h-[44px]">
      <input type="radio" checked={checked} onChange={onChange} className="h-4 w-4 accent-primary" />
      <span className="text-sm">{label}</span>
    </label>
  )
}
