'use client'

import { useState, useEffect, useCallback } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { useRouter } from 'next/navigation'
import {
  Search, UserPlus, MoreHorizontal, ArrowRightLeft,
  ExternalLink, UserMinus, GraduationCap, Ban, X,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Portal } from '@/components/ui/portal'
import { toast } from 'sonner'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { TABLE_CONTAINER_WITH_TABS_CLASS, TABLE_HEADER_CLASS } from '@/lib/table-constants'
import { SortableHeader, toggleSort, type SortDir } from '@/components/shared/SortableHeader'
import { ENROLLMENT_STATUS_COLORS } from '@/lib/colors'
import type { StudentEntry } from '../../types'

interface ClassStudentsTabProps {
  classYearId: string
  sections: { id: string; name: string }[]
  initialSectionId?: string | null
  onOpenStudent?: (serialNo: number, name: string) => void
}

export function ClassStudentsTab({ classYearId, sections, initialSectionId, onOpenStudent }: ClassStudentsTabProps) {
  const { addParams, apiParam } = useInstitutionId()
  const confirm = useConfirm()
  const [students, setStudents] = useState<StudentEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(initialSectionId ?? 'all')
  const [search, setSearch] = useState('')
  const [showEnroll, setShowEnroll] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkProcessing, setBulkProcessing] = useState(false)

  /* Sort */
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)

  const handleSort = (field: string) => {
    const { field: f, dir: d } = toggleSort(field, sortField, sortDir)
    setSortField(f)
    setSortDir(d)
  }

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.set('sectionId', filter)
      addParams(params)
      const res = await fetch(`/api/school/classes/${classYearId}/students?${params}`)
      if (res.ok) setStudents((await res.json()) as StudentEntry[])
    } catch { /* empty */ }
    setLoading(false)
  }, [classYearId, filter])

  useEffect(() => { fetchStudents() }, [fetchStudents])

  const filtered = search
    ? students.filter((s) => {
        const q = search.toLowerCase()
        const name = `${s.student.firstName} ${s.student.lastName}`.toLowerCase()
        return name.includes(q) || s.student.admissionNo.toLowerCase().includes(q)
      })
    : students

  const activeStudents = filtered.filter(s => s.status === 'ACTIVE')
  const allSelected = activeStudents.length > 0 && activeStudents.every(s => selected.has(s.student.id))
  const someSelected = selected.size > 0

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(activeStudents.map(s => s.student.id)))
    }
  }

  const toggleOne = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const handleBulkAction = async (action: 'promote' | 'detain' | 'unenroll') => {
    const ids = Array.from(selected)
    if (ids.length === 0) return

    const actionLabel = action === 'promote' ? 'Promote' : action === 'detain' ? 'Detain' : 'Unenroll'
    const ok = await confirm({
      title: `${actionLabel} Students`,
      description: `${actionLabel} ${ids.length} student${ids.length !== 1 ? 's' : ''}?`,
      note: 'This action cannot be undone.',
      destructive: true,
      confirmLabel: actionLabel,
    })
    if (!ok) return

    setBulkProcessing(true)

    if (action === 'unenroll') {
      let count = 0
      for (const studentId of ids) {
        const res = await fetch(`/api/school/classes/${classYearId}/students/${studentId}${apiParam}`, { method: 'DELETE' })
        if (res.ok) count++
      }
      toast.success(`${count} student${count !== 1 ? 's' : ''} unenrolled`)
    } else {
      // Promote or detain via the promote API
      const decisions = ids.map(studentId => ({
        studentId,
        status: action === 'promote' ? 'PROMOTED' : 'DETAINED',
      }))
      const res = await fetch(`/api/school/classes/${classYearId}/promote${apiParam}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decisions }),
      })
      if (res.ok) {
        const data = await res.json() as { results: { success: boolean }[] }
        const successCount = data.results.filter(r => r.success).length
        toast.success(`${successCount} student${successCount !== 1 ? 's' : ''} ${action === 'promote' ? 'promoted' : 'detained'}`)
      } else {
        const err = await res.json() as { error: string }
        toast.error(err.error ?? 'Failed')
      }
    }

    setBulkProcessing(false)
    setSelected(new Set())
    fetchStudents()
  }

  return (
    <div className="space-y-4 pt-4">
      {/* Filters + actions */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex flex-wrap gap-2">
          <FilterPill label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
          {sections.map((s) => (
            <FilterPill key={s.id} label={s.name} active={filter === s.id} onClick={() => setFilter(s.id)} />
          ))}
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." value={search}
              onChange={(e) => setSearch(e.target.value)} className="pl-9 w-48 min-h-[44px]" />
          </div>
          <Button size="sm" className="min-h-[44px]" onClick={() => setShowEnroll(true)}>
            <UserPlus className="h-4 w-4 mr-1" /> Enroll
          </Button>
        </div>
      </div>

      {/* Bulk action bar */}
      {someSelected && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary/5 border border-primary/20">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="flex items-center gap-1.5 ml-auto">
            <Button size="sm" variant="outline" className="min-h-[36px] gap-1.5"
              disabled={bulkProcessing}
              onClick={() => handleBulkAction('promote')}>
              <GraduationCap className="h-3.5 w-3.5" /> Promote
            </Button>
            <Button size="sm" variant="outline" className="min-h-[36px] gap-1.5"
              disabled={bulkProcessing}
              onClick={() => handleBulkAction('detain')}>
              <Ban className="h-3.5 w-3.5" /> Detain
            </Button>
            <Button size="sm" variant="outline" className="min-h-[36px] gap-1.5 text-red-600 hover:text-red-700"
              disabled={bulkProcessing}
              onClick={() => handleBulkAction('unenroll')}>
              <UserMinus className="h-3.5 w-3.5" /> Unenroll
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0"
              onClick={() => setSelected(new Set())}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
          {search ? 'No students match your search.' : 'No students in this class.'}
        </div>
      ) : (
        <div className={TABLE_CONTAINER_WITH_TABS_CLASS}>
          <table className="w-full text-sm">
            <thead className={TABLE_HEADER_CLASS}>
              <tr className="border-b">
                <th className="w-10 px-4 py-3">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                  />
                </th>
                <SortableHeader label="Student" field="firstName" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Admission No" field="admissionNo" currentField={sortField} currentDir={sortDir} onSort={handleSort} className="hidden sm:table-cell" />
                <SortableHeader label="Roll No" field="rollNo" currentField={sortField} currentDir={sortDir} onSort={handleSort} className="hidden md:table-cell" />
                <SortableHeader label="Section" field="sectionName" currentField={sortField} currentDir={sortDir} onSort={handleSort} className="hidden lg:table-cell" />
                <SortableHeader label="Status" field="status" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const sorted = [...filtered].sort((a, b) => {
                  if (!sortField || !sortDir) return 0
                  let av: string | number | null | undefined
                  let bv: string | number | null | undefined
                  if (sortField === 'firstName') { av = a.student.firstName; bv = b.student.firstName }
                  else if (sortField === 'admissionNo') { av = a.student.admissionNo; bv = b.student.admissionNo }
                  else if (sortField === 'rollNo') { av = a.student.rollNo; bv = b.student.rollNo }
                  else if (sortField === 'sectionName') { av = a.sectionName; bv = b.sectionName }
                  else if (sortField === 'status') { av = a.status; bv = b.status }
                  else return 0
                  if (av == null && bv == null) return 0
                  if (av == null) return 1
                  if (bv == null) return -1
                  if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av
                  const r = String(av).localeCompare(String(bv))
                  return sortDir === 'asc' ? r : -r
                })
                return sorted.map((entry) => (
                <StudentRow key={entry.student.id} entry={entry} classYearId={classYearId}
                  sections={sections} onRefresh={fetchStudents} onOpenStudent={onOpenStudent}
                  isSelected={selected.has(entry.student.id)}
                  onToggleSelect={() => toggleOne(entry.student.id)} />
                ))
              })()}
            </tbody>
          </table>
        </div>
      )}

      {showEnroll && (
        <EnrollSheet classYearId={classYearId} sections={sections}
          onClose={() => setShowEnroll(false)} onDone={() => { setShowEnroll(false); fetchStudents() }} />
      )}
    </div>
  )
}

/* ── Filter pill ── */
function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium min-h-[44px] transition-colors
        ${active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
      {label}
    </button>
  )
}

/* ── Row with actions ── */
function StudentRow({ entry, classYearId, sections, onRefresh, onOpenStudent, isSelected, onToggleSelect }: {
  entry: StudentEntry; classYearId: string
  sections: { id: string; name: string }[]; onRefresh: () => void
  onOpenStudent?: (serialNo: number, name: string) => void
  isSelected: boolean; onToggleSelect: () => void
}) {
  const router = useRouter()
  const { apiParam } = useInstitutionId()
  const confirm = useConfirm()
  const { student, sectionName, status } = entry
  const [menuOpen, setMenuOpen] = useState(false)
  const [moveOpen, setMoveOpen] = useState(false)
  const sc = ENROLLMENT_STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'

  const handleMove = async (sectionId: string) => {
    const res = await fetch(`/api/school/classes/${classYearId}/students/${student.id}${apiParam}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sectionId }),
    })
    if (res.ok) { toast.success('Section updated'); onRefresh() }
    else { const e = await res.json(); toast.error(e.error ?? 'Failed') }
    setMoveOpen(false); setMenuOpen(false)
  }

  const handleUnenroll = async () => {
    const ok = await confirm({
      title: 'Unenroll Student',
      description: `Unenroll ${student.firstName} ${student.lastName}?`,
      note: 'The student will be removed from this class.',
      destructive: true,
      confirmLabel: 'Unenroll',
    })
    if (!ok) return
    const res = await fetch(`/api/school/classes/${classYearId}/students/${student.id}${apiParam}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Student unenrolled'); onRefresh() }
    else { const e = await res.json(); toast.error(e.error ?? 'Failed') }
    setMenuOpen(false)
  }

  const handlePromote = async () => {
    const ok = await confirm({
      title: 'Promote Student',
      description: `Promote ${student.firstName} ${student.lastName}?`,
      note: 'This action cannot be undone.',
      destructive: true,
      confirmLabel: 'Promote',
    })
    if (!ok) return
    const res = await fetch(`/api/school/classes/${classYearId}/promote${apiParam}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decisions: [{ studentId: student.id, status: 'PROMOTED' }] }),
    })
    if (res.ok) { toast.success('Student promoted'); onRefresh() }
    else { const e = await res.json(); toast.error(e.error ?? 'Failed') }
    setMenuOpen(false)
  }

  const handleDetain = async () => {
    const ok = await confirm({
      title: 'Detain Student',
      description: `Detain ${student.firstName} ${student.lastName}?`,
      note: 'This action cannot be undone.',
      destructive: true,
      confirmLabel: 'Detain',
    })
    if (!ok) return
    const res = await fetch(`/api/school/classes/${classYearId}/promote${apiParam}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decisions: [{ studentId: student.id, status: 'DETAINED' }] }),
    })
    if (res.ok) { toast.success('Student detained'); onRefresh() }
    else { const e = await res.json(); toast.error(e.error ?? 'Failed') }
    setMenuOpen(false)
  }

  return (
    <tr className={`border-b last:border-0 transition-colors
      ${isSelected ? 'bg-primary/5' : 'hover:bg-muted/30'}`}>
      <td className="w-10 px-4 py-3">
        {status === 'ACTIVE' && (
          <Checkbox checked={isSelected} onCheckedChange={onToggleSelect} />
        )}
      </td>
      <td className="px-4 py-3 font-medium">
        {onOpenStudent ? (
          <button type="button" onClick={() => onOpenStudent(student.serialNo, `${student.firstName} ${student.lastName}`)}
            className="hover:text-primary hover:underline transition-colors text-left">
            {student.firstName} {student.lastName}
          </button>
        ) : (
          <span>{student.firstName} {student.lastName}</span>
        )}
      </td>
      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{student.admissionNo}</td>
      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{student.rollNo ?? '—'}</td>
      <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{sectionName}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sc}`}>{status}</span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="relative inline-block">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setMenuOpen(!menuOpen)}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => { setMenuOpen(false); setMoveOpen(false) }} />
              <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-lg border bg-popover shadow-md py-1">
                <button type="button" className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted min-h-[44px]"
                  onClick={() => { setMenuOpen(false); router.push(`/management/students/${student.serialNo}`) }}>
                  <ExternalLink className="h-4 w-4" /> View Profile
                </button>
                {status === 'ACTIVE' && (
                  <>
                    <button type="button" className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted min-h-[44px]"
                      onClick={() => setMoveOpen(!moveOpen)}>
                      <ArrowRightLeft className="h-4 w-4" /> Move Section
                    </button>
                    {moveOpen && (
                      <div className="border-t mx-2 pt-1">
                        {sections.filter(s => s.id !== entry.sectionId).map(s => (
                          <button key={s.id} type="button"
                            className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted rounded"
                            onClick={() => handleMove(s.id)}>
                            → {s.name}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="border-t mx-2 my-1" />
                    <button type="button" className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted min-h-[44px]"
                      onClick={handlePromote}>
                      <GraduationCap className="h-4 w-4" /> Promote
                    </button>
                    <button type="button" className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted min-h-[44px]"
                      onClick={handleDetain}>
                      <Ban className="h-4 w-4" /> Detain
                    </button>
                    <div className="border-t mx-2 my-1" />
                    <button type="button" className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted min-h-[44px] text-red-600"
                      onClick={handleUnenroll}>
                      <UserMinus className="h-4 w-4" /> Unenroll
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}

/* ── Enroll sheet ── */
interface SearchResult { id: string; firstName: string; lastName: string; admissionNo: string }

function EnrollSheet({ classYearId, sections, onClose, onDone }: {
  classYearId: string; sections: { id: string; name: string }[]
  onClose: () => void; onDone: () => void
}) {
  const { apiParam, iid } = useInstitutionId()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [sectionId, setSectionId] = useState(sections[0]?.id ?? '')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!query) { setResults([]); return }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/school/students?search=${encodeURIComponent(query)}&pageSize=10${iid ? `&iid=${iid}` : ''}`)
      if (res.ok) {
        const data = await res.json() as { students: SearchResult[] }
        setResults(data.students ?? [])
      }
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const handleEnroll = async () => {
    if (!sectionId || selected.size === 0) return
    setSubmitting(true)
    let enrolled = 0
    for (const studentId of Array.from(selected)) {
      const res = await fetch(`/api/school/classes/${classYearId}/students${apiParam}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, sectionId }),
      })
      if (res.ok) enrolled++
    }
    toast.success(`${enrolled} student${enrolled !== 1 ? 's' : ''} enrolled`)
    setSubmitting(false)
    onDone()
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-background border-l shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Enroll Students</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          <div>
            <label className="text-sm font-medium mb-1 block">Section</label>
            <select value={sectionId} onChange={e => setSectionId(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
              {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Search students</label>
            <Input placeholder="Name or admission no..." value={query}
              onChange={e => setQuery(e.target.value)} className="min-h-[44px]" />
          </div>
          {results.length > 0 && (
            <div className="rounded-lg border divide-y max-h-64 overflow-y-auto">
              {results.map(s => (
                <label key={s.id} className="flex items-center gap-3 px-3 py-2 hover:bg-muted cursor-pointer min-h-[44px]">
                  <input type="checkbox" checked={selected.has(s.id)}
                    onChange={() => toggle(s.id)} className="h-4 w-4 accent-primary" />
                  <span className="text-sm font-medium">{s.firstName} {s.lastName}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{s.admissionNo}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="p-4 border-t">
          <Button className="w-full min-h-[44px]" disabled={selected.size === 0 || submitting}
            onClick={handleEnroll}>
            {submitting ? 'Enrolling...' : `Enroll ${selected.size} student${selected.size !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </div>
    </Portal>
  )
}
