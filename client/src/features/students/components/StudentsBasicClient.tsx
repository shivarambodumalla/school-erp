'use client'

import { useState, useEffect, useCallback, type MouseEvent } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, UserX, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { StudentDetailInline } from './StudentDetailInline'

interface Student {
  id: string
  serialNo: number
  firstName: string
  lastName: string
  admissionNo: string
  rollNo: string | null
  status: string
  photoUrl: string | null
  class: { name: string } | null
  section: { name: string } | null
}

interface StudentTab {
  id: string
  serialNo: number
  firstName: string
  lastName: string
  admissionNo: string
}

const MAX_TABS = 10
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-emerald-500',
  'bg-amber-500', 'bg-rose-500', 'bg-indigo-500',
]

function getColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] ?? 'bg-gray-500'
}

function getInitials(f: string, l: string) {
  return `${f[0] ?? ''}${l[0] ?? ''}`.toUpperCase()
}

export function StudentsBasicClient() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [students, setStudents] = useState<Student[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // Tab state
  const urlTabId = searchParams.get('id')
  const [activeTab, setActiveTab] = useState(urlTabId ?? 'all')
  const [openTabs, setOpenTabs] = useState<StudentTab[]>([])
  const openedSerials = new Set(openTabs.map(t => t.serialNo))
  const hasOpenTabs = openTabs.length > 0

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  useEffect(() => {
    const id = searchParams.get('id')
    if (id) setActiveTab(id)
    else setActiveTab('all')
  }, [searchParams])

  const updateUrl = useCallback((tabId: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (tabId) params.set('id', tabId)
    else params.delete('id')
    const qs = params.toString()
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
  }, [router, pathname, searchParams])

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      params.set('page', String(page))
      params.set('pageSize', String(pageSize))
      const res = await fetch(`/api/school/students?${params}`)
      if (!res.ok) { setStudents([]); setTotal(0); setLoading(false); return }
      const data = await res.json() as { students: Student[]; total: number }
      setStudents(data.students ?? [])
      setTotal(data.total ?? 0)
    } catch {
      setStudents([]); setTotal(0)
    }
    setLoading(false)
  }, [search, page, pageSize])

  useEffect(() => {
    const t = setTimeout(fetchStudents, 300)
    return () => clearTimeout(t)
  }, [fetchStudents])

  // Reset to page 1 on search or pageSize change
  useEffect(() => { setPage(1) }, [search, pageSize])

  const openStudent = useCallback((tab: StudentTab, navigate: boolean) => {
    setOpenTabs(prev => {
      if (prev.some(t => t.id === tab.id)) return prev
      const next = [...prev, tab]
      if (next.length > MAX_TABS) next.shift()
      return next
    })
    if (navigate) {
      setActiveTab(tab.id)
      updateUrl(tab.id)
    }
  }, [updateUrl])

  const closeTab = useCallback((tabId: string) => {
    setOpenTabs(prev => {
      const idx = prev.findIndex(t => t.id === tabId)
      const next = prev.filter(t => t.id !== tabId)
      setActiveTab(current => {
        if (current !== tabId) return current
        const leftTab = idx > 0 ? prev[idx - 1] : null
        const newActive = leftTab ? leftTab.id : 'all'
        updateUrl(newActive === 'all' ? null : newActive)
        return newActive
      })
      return next
    })
  }, [updateUrl])

  const handleTabSwitch = useCallback((tabId: string) => {
    setActiveTab(tabId)
    updateUrl(tabId === 'all' ? null : tabId)
  }, [updateUrl])

  const handleRowClick = useCallback((s: Student, e: MouseEvent) => {
    const tab: StudentTab = {
      id: String(s.serialNo), serialNo: s.serialNo,
      firstName: s.firstName, lastName: s.lastName,
      admissionNo: s.admissionNo,
    }
    if (e.ctrlKey || e.metaKey) {
      openStudent(tab, false)
    } else {
      openStudent(tab, true)
    }
  }, [openStudent])

  return (
    <div>
      {/* Tab bar */}
      {hasOpenTabs && (
        <div className="sticky top-0 z-10 bg-background -mt-4 md:-mt-6 -mx-4 md:-mx-6 overflow-hidden">
          <div className="flex items-center border-b overflow-x-auto scrollbar-none px-4 md:px-6">
            <button type="button" onClick={() => handleTabSwitch('all')}
              className={`shrink-0 flex items-center gap-2 px-4 h-10 text-sm font-medium
                border-b-2 transition-colors
                ${activeTab === 'all'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              All Students
            </button>
            {openTabs.map(t => (
              <div key={t.id}
                className={`shrink-0 flex items-center gap-1 pl-3 pr-1 h-10
                  border-b-2 transition-colors group
                  ${activeTab === t.id
                    ? 'border-primary text-foreground bg-muted/50'
                    : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                <button type="button" onClick={() => handleTabSwitch(t.id)}
                  className="text-sm font-medium truncate max-w-[120px]"
                  title={`${t.firstName} ${t.lastName} — ${t.admissionNo}`}>
                  {t.firstName} {t.lastName}
                </button>
                <button type="button"
                  onClick={(e) => { e.stopPropagation(); closeTab(t.id) }}
                  className={`p-0.5 rounded transition-colors
                    ${activeTab === t.id
                      ? 'text-foreground/60 hover:text-foreground hover:bg-muted'
                      : 'text-muted-foreground/40 hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100'}`}>
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {activeTab === 'all' ? (
        <div className="space-y-4 pt-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Students ({total})</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 w-48 min-h-[44px]" />
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="rounded-xl border bg-card divide-y">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4">
                  <div className="h-10 w-10 rounded-full bg-muted animate-pulse shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-40 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="rounded-xl border bg-card flex flex-col items-center justify-center py-20 gap-3 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <UserX className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-medium">No students found</p>
              <p className="text-sm text-muted-foreground">
                {search ? 'Try a different search term' : 'Enroll students via Admissions'}
              </p>
              {!search && (
                <Button variant="outline" size="sm"
                  onClick={() => router.push('/management/admissions/new')}>
                  Start an Admission
                </Button>
              )}
            </div>
          ) : (
            <>
              <StudentsTable students={students} openedSerials={openedSerials} onRowClick={handleRowClick} />
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-muted-foreground">
                      Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
                    </p>
                    <select value={pageSize}
                      onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}
                      className="h-9 rounded-md border border-input bg-background px-2 text-sm">
                      {PAGE_SIZE_OPTIONS.map(n => (
                        <option key={n} value={n}>{n} / page</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-9 w-9"
                      disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                      .reduce<(number | 'dots')[]>((acc, p, i, arr) => {
                        if (i > 0 && p - (arr[i - 1] ?? 0) > 1) acc.push('dots')
                        acc.push(p)
                        return acc
                      }, [])
                      .map((item, i) =>
                        item === 'dots' ? (
                          <span key={`dots-${i}`} className="px-1 text-muted-foreground text-sm">...</span>
                        ) : (
                          <Button key={item} variant={page === item ? 'default' : 'outline'}
                            size="icon" className="h-9 w-9"
                            onClick={() => setPage(item)}>
                            {item}
                          </Button>
                        )
                      )}
                    <Button variant="outline" size="icon" className="h-9 w-9"
                      disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <StudentDetailInline studentId={activeTab} />
      )}
    </div>
  )
}

function StudentsTable({ students, openedSerials, onRowClick }: {
  students: Student[]
  openedSerials: Set<number>
  onRowClick: (s: Student, e: MouseEvent<HTMLTableRowElement>) => void
}) {
  return (
    <div className="rounded-xl border overflow-hidden max-h-[calc(100vh-220px)] overflow-y-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-[1] bg-muted/95 backdrop-blur-sm">
          <tr className="border-b">
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Admission No</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Class</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
          </tr>
        </thead>
        <tbody>
          {students.map(s => {
            const isOpened = openedSerials.has(s.serialNo)
            return (
              <tr key={s.id} onClick={(e) => onRowClick(s, e)}
                className={`border-b last:border-0 cursor-pointer transition-colors
                  ${isOpened ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/50'}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center
                      text-white text-xs font-bold ${getColor(s.firstName)}`}>
                      {getInitials(s.firstName, s.lastName)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{s.firstName} {s.lastName}</span>
                      {isOpened && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{s.admissionNo}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {s.class?.name ?? '—'}{s.section ? ` ${s.section.name}` : ''}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                    ${s.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {s.status}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
