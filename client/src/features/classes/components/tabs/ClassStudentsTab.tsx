'use client'

import { useState, useEffect, useCallback } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { useRouter } from 'next/navigation'
import { Search, UserPlus, MoreHorizontal, ArrowRightLeft, ExternalLink, UserMinus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { StudentEntry } from '../../types'

interface ClassStudentsTabProps {
  classYearId: string
  sections: { id: string; name: string }[]
}

export function ClassStudentsTab({ classYearId, sections }: ClassStudentsTabProps) {
  const { addParams } = useInstitutionId()
  const [students, setStudents] = useState<StudentEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showEnroll, setShowEnroll] = useState(false)

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

  return (
    <div className="space-y-4 pt-4">
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
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th className="text-left px-4 py-3 font-medium">Student</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Admission No</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Roll No</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Section</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <StudentRow key={entry.student.id} entry={entry} classYearId={classYearId}
                  sections={sections} onRefresh={fetchStudents} />
              ))}
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
const STATUS_STYLE: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  PROMOTED: 'bg-blue-100 text-blue-700',
  DETAINED: 'bg-red-100 text-red-700',
  TRANSFERRED: 'bg-gray-100 text-gray-600',
}

function StudentRow({ entry, classYearId, sections, onRefresh }: {
  entry: StudentEntry; classYearId: string
  sections: { id: string; name: string }[]; onRefresh: () => void
}) {
  const router = useRouter()
  const { apiParam } = useInstitutionId()
  const { student, sectionName, status } = entry
  const [menuOpen, setMenuOpen] = useState(false)
  const [moveOpen, setMoveOpen] = useState(false)
  const sc = STATUS_STYLE[status] ?? 'bg-gray-100 text-gray-600'

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
    if (!confirm(`Unenroll ${student.firstName} ${student.lastName}?`)) return
    const res = await fetch(`/api/school/classes/${classYearId}/students/${student.id}${apiParam}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Student unenrolled'); onRefresh() }
    else { const e = await res.json(); toast.error(e.error ?? 'Failed') }
    setMenuOpen(false)
  }

  return (
    <tr className="border-b last:border-0 hover:bg-muted/30">
      <td className="px-4 py-3 font-medium">{student.firstName} {student.lastName}</td>
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
                  onClick={() => router.push(`/management/students/${student.serialNo}`)}>
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
    <>
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
    </>
  )
}
