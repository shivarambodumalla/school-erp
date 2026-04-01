'use client'

import { useState, useEffect, useCallback } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { Plus, Trash2, Users, AlertTriangle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import type { SectionData, PromoteStudent } from '../types'

interface ClassSettingsViewProps {
  classYearId: string
  className: string
  gradeLevel: number
  academicYearName: string
}

type Decision = 'PROMOTED' | 'DETAINED'

interface NextClassInfo {
  id: string
  sections: { id: string; name: string }[]
  classTemplateName: string
}

export function ClassSettingsView({
  classYearId,
  className,
  gradeLevel,
  academicYearName,
}: ClassSettingsViewProps) {
  return (
    <div className="space-y-6">
      <ClassInfoCard
        className={className}
        gradeLevel={gradeLevel}
        academicYearName={academicYearName}
      />
      <SectionsManagementCard classYearId={classYearId} />
      <PromoteStudentsCard
        classYearId={classYearId}
        gradeLevel={gradeLevel}
        academicYearName={academicYearName}
      />
    </div>
  )
}

/* ─── Class Info Card (read-only) ─── */

function ClassInfoCard({
  className,
  gradeLevel,
  academicYearName,
}: {
  className: string
  gradeLevel: number
  academicYearName: string
}) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-3">
      <h3 className="text-base font-semibold">Class Info</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Class Name</p>
          <p className="font-medium mt-0.5">{className}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Grade Level</p>
          <p className="font-medium mt-0.5">{gradeLevel}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Academic Year</p>
          <p className="font-medium mt-0.5">{academicYearName}</p>
        </div>
      </div>
    </div>
  )
}

/* ─── Sections Management Card ─── */

function SectionsManagementCard({ classYearId }: { classYearId: string }) {
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
  }, [classYearId, apiParam])

  useEffect(() => { fetchSections() }, [fetchSections])

  const handleDelete = async (sectionId: string, sectionName: string) => {
    if (!confirm(`Delete section "${sectionName}"? Students in this section will be unassigned.`)) return
    try {
      const res = await fetch(
        `/api/school/classes/${classYearId}/sections${apiParam ? apiParam + '&' : '?'}sectionId=${sectionId}`,
        { method: 'DELETE' },
      )
      if (res.ok) {
        toast.success(`Section "${sectionName}" deleted`)
        fetchSections()
      } else {
        const err = (await res.json()) as { error: string }
        toast.error(err.error)
      }
    } catch {
      toast.error('Something went wrong')
    }
  }

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Sections Management</h3>
        <Button size="sm" className="min-h-[44px]" onClick={() => setSheetOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Section
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : sections.length === 0 ? (
        <div className="rounded-lg border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          No sections yet. Add one to get started.
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Max Strength</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Students</th>
                <th className="text-right px-4 py-3 font-medium w-16" />
              </tr>
            </thead>
            <tbody>
              {sections.map((s) => (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {s.maxStrength ?? '—'}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      {s._count.students}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id, s.name)}
                      className="p-2 rounded-md text-muted-foreground hover:text-red-600
                        hover:bg-red-50 transition-colors min-h-[44px] min-w-[44px]
                        inline-flex items-center justify-center"
                      title={`Delete ${s.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddSectionSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        classYearId={classYearId}
        onCreated={fetchSections}
      />
    </div>
  )
}

function AddSectionSheet({ open, onClose, classYearId, onCreated }: {
  open: boolean
  onClose: () => void
  classYearId: string
  onCreated: () => void
}) {
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
        toast.success('Section added')
        setName('')
        setMaxStrength('')
        onCreated()
        onClose()
      } else {
        const err = (await res.json()) as { error: string }
        toast.error(err.error)
      }
    } catch {
      toast.error('Something went wrong')
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
            <Label htmlFor="settings-sec-name">Section Name</Label>
            <Input
              id="settings-sec-name"
              placeholder="e.g. Section A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="min-h-[44px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-sec-max">Max Strength (optional)</Label>
            <Input
              id="settings-sec-max"
              type="number"
              min={1}
              value={maxStrength}
              onChange={(e) => setMaxStrength(e.target.value)}
              className="min-h-[44px]"
            />
          </div>
          <Button type="submit" className="w-full min-h-[44px]" disabled={saving}>
            {saving ? 'Adding...' : 'Add Section'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}

/* ─── Promote Students Card ─── */

function PromoteStudentsCard({
  classYearId,
  gradeLevel,
  academicYearName,
}: {
  classYearId: string
  gradeLevel: number
  academicYearName: string
}) {
  const { apiParam } = useInstitutionId()
  const [expanded, setExpanded] = useState(false)
  const [students, setStudents] = useState<PromoteStudent[]>([])
  const [loading, setLoading] = useState(false)
  const [decisions, setDecisions] = useState<Record<string, Decision>>({})
  const [sectionChoices, setSectionChoices] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [nextClass, setNextClass] = useState<NextClassInfo | null>(null)
  const [nextClassLoading, setNextClassLoading] = useState(false)

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
  }, [classYearId, apiParam])

  const fetchNextClass = useCallback(async () => {
    setNextClassLoading(true)
    try {
      const r = await fetch(`/api/school/classes${apiParam}`)
      if (!r.ok) { setNextClassLoading(false); return }
      const classes = await r.json() as {
        id: string; name: string; gradeLevel: number
        activeYear: { id: string } | null
      }[]
      const nextGrade = classes.find(c => c.gradeLevel === gradeLevel + 1)
      if (nextGrade?.activeYear) {
        const detailRes = await fetch(`/api/school/classes/${nextGrade.activeYear.id}${apiParam}`)
        if (detailRes.ok) {
          const detail = await detailRes.json()
          setNextClass({
            id: nextGrade.activeYear.id,
            classTemplateName: nextGrade.name,
            sections: (detail.sections ?? []).map((s: { id: string; name: string }) => ({
              id: s.id, name: s.name,
            })),
          })
        }
      }
    } catch { /* empty */ }
    setNextClassLoading(false)
  }, [gradeLevel, apiParam])

  useEffect(() => {
    if (expanded) {
      fetchStudents()
      fetchNextClass()
    }
  }, [expanded, fetchStudents, fetchNextClass])

  const promotedCount = Object.values(decisions).filter(d => d === 'PROMOTED').length
  const detainedCount = Object.values(decisions).filter(d => d === 'DETAINED').length

  const handleConfirm = async () => {
    if (!confirm(`Promote ${promotedCount} and detain ${detainedCount} students? This cannot be undone.`)) return
    const list = Object.entries(decisions).map(([studentId, status]) => ({
      studentId, status,
      ...(status === 'PROMOTED' && sectionChoices[studentId]
        ? { toSectionId: sectionChoices[studentId] }
        : {}),
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

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Promote Students</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Move students to the next grade level.
          </p>
        </div>
        <Button
          variant={expanded ? 'secondary' : 'default'}
          size="sm"
          className="min-h-[44px]"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Collapse' : 'Open Promote Flow'}
        </Button>
      </div>

      {expanded && (
        <div className="space-y-4 pt-2">
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
                <p className="font-semibold">
                  Promoting to: {nextClass.classTemplateName} &mdash; {academicYearName}
                </p>
                <p>Sections available: {nextClass.sections.map(s => s.name).join(', ') || 'None'}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-semibold">Next class not found</p>
                <p>
                  Grade {gradeLevel + 1} for {academicYearName} hasn&apos;t been created yet.
                  Create it first before promoting students.
                </p>
              </div>
            </div>
          )}

          {/* Student list */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="rounded-lg border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              No active students to promote.
            </div>
          ) : (
            <>
              <div className="rounded-lg border overflow-hidden">
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
                            <span className="font-medium">
                              {s.student.firstName} {s.student.lastName}
                            </span>
                            <span className="text-muted-foreground text-xs ml-2">
                              {s.student.admissionNo}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                          {s.section.name}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-4">
                            <RadioOption
                              label="Promote"
                              checked={decisions[s.student.id] === 'PROMOTED'}
                              onChange={() => setDecisions(prev => ({ ...prev, [s.student.id]: 'PROMOTED' }))}
                            />
                            <RadioOption
                              label="Detain"
                              checked={decisions[s.student.id] === 'DETAINED'}
                              onChange={() => setDecisions(prev => ({ ...prev, [s.student.id]: 'DETAINED' }))}
                            />
                          </div>
                        </td>
                        {nextClass && nextClass.sections.length > 1 && (
                          <td className="px-4 py-3 hidden md:table-cell">
                            {decisions[s.student.id] === 'PROMOTED' ? (
                              <select
                                value={sectionChoices[s.student.id] ?? ''}
                                onChange={e => setSectionChoices(prev => ({
                                  ...prev, [s.student.id]: e.target.value,
                                }))}
                                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                              >
                                <option value="">Auto (first)</option>
                                {nextClass.sections.map(sec => (
                                  <option key={sec.id} value={sec.id}>{sec.name}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-muted-foreground text-xs">&mdash;</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Promoting {promotedCount}, Detaining {detainedCount}
                </p>
                <Button
                  className="min-h-[44px]"
                  disabled={submitting || (!nextClass && promotedCount > 0)}
                  onClick={handleConfirm}
                >
                  {submitting ? 'Processing...' : 'Confirm Promotions'}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
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
