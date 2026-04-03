'use client'

import { useState, useEffect, useCallback, useRef, type MouseEvent } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import {
  Search, UserX, X, SlidersHorizontal,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { StudentDetailInline } from './StudentDetailInline'
import { SortableHeader, toggleSort, sortData, type SortDir } from '@/components/shared/SortableHeader'

/* ─── Interfaces ─── */

interface StudentRow {
  id: string
  serialNo: number
  firstName: string
  lastName: string
  admissionNo: string
  rollNo: string | null
  status: string
  photoUrl: string | null
  className: string | null
  sectionName: string | null
  isAssigned: boolean
}

interface StudentTab {
  id: string
  serialNo: number
  firstName: string
  lastName: string
}

interface ClassOption {
  id: string
  name: string
  yearName: string
}

interface FilterCounts {
  totalActive: number
  totalInactive: number
  totalUnassigned: number
  totalTransferred: number
}

/* ─── localStorage helpers ─── */

const STUDENT_TABS_KEY = 'onflows-students-open-tabs'

function loadStudentTabs(): StudentTab[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STUDENT_TABS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as StudentTab[]) : []
  } catch {
    return []
  }
}

function saveStudentTabs(tabs: StudentTab[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STUDENT_TABS_KEY, JSON.stringify(tabs))
}

/* ─── Constants ─── */

import { TABLE_CONTAINER_CLASS, TABLE_HEADER_CLASS, DEFAULT_PAGE_SIZE, LIST_PAGE_CLASS } from '@/lib/table-constants'
import { TablePagination } from '@/components/shared/TablePagination'
const MAX_TABS = 10

import { generateColor, getInitials } from '@/lib/colors'

/* ─── Status filter definitions ─── */

type StatusFilterKey = 'ALL' | 'ACTIVE' | 'INACTIVE' | 'UNASSIGNED'

interface StatusPill {
  key: StatusFilterKey
  label: string
  countKey: keyof FilterCounts | null
}

const STATUS_PILLS: StatusPill[] = [
  { key: 'ALL', label: 'All', countKey: null },
  { key: 'ACTIVE', label: 'Active', countKey: 'totalActive' },
  { key: 'INACTIVE', label: 'Inactive', countKey: 'totalInactive' },
  { key: 'UNASSIGNED', label: 'Unassigned', countKey: 'totalUnassigned' },
]

/* ─── Main component ─── */

export function StudentsBasicClient() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { addParams } = useInstitutionId()
  /* Data */
  const [students, setStudents] = useState<StudentRow[]>([])
  const [classOptions, setClassOptions] = useState<ClassOption[]>([])
  const [counts, setCounts] = useState<FilterCounts>({
    totalActive: 0, totalInactive: 0, totalUnassigned: 0, totalTransferred: 0,
  })
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  /* Filters */
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilterKey>('ALL')
  const [classFilter, setClassFilter] = useState('ALL')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeFilterCount = (statusFilter !== 'ALL' ? 1 : 0) + (classFilter !== 'ALL' ? 1 : 0)

  /* Sort */
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)

  const handleSort = (field: string) => {
    const { field: f, dir: d } = toggleSort(field, sortField, sortDir)
    setSortField(f)
    setSortDir(d)
  }

  /* Tabs — activeTab derived from URL, openTabs persisted to localStorage */
  const activeTab = searchParams.get('id') ?? 'all'
  const [openTabs, setOpenTabs] = useState<StudentTab[]>([])
  const [tabsLoaded, setTabsLoaded] = useState(false)

  const openedSerials = new Set(openTabs.map(t => t.serialNo))
  const hasOpenTabs = openTabs.length > 0

  /* Load tabs from localStorage on mount (avoids hydration mismatch) */
  useEffect(() => {
    setOpenTabs(loadStudentTabs())
    setTabsLoaded(true)
  }, [])

  /* Persist tabs to localStorage on change */
  useEffect(() => {
    if (tabsLoaded) saveStudentTabs(openTabs)
  }, [openTabs, tabsLoaded])

  /* ─── URL tab management ─── */

  const setActiveTab = useCallback((tabId: string) => {
    const params = new URLSearchParams(window.location.search)
    if (tabId && tabId !== 'all') params.set('id', tabId)
    else params.delete('id')
    const qs = params.toString()
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
  }, [router, pathname])

  const openStudent = useCallback((tab: StudentTab, navigate: boolean) => {
    setOpenTabs(prev => {
      if (prev.some(t => t.id === tab.id)) return prev
      const next = [...prev, tab]
      if (next.length > MAX_TABS) next.shift()
      return next
    })
    if (navigate) {
      setActiveTab(String(tab.serialNo))
    }
  }, [setActiveTab])

  const closeTab = useCallback((tabId: string) => {
    setOpenTabs(prev => {
      const idx = prev.findIndex(t => String(t.serialNo) === tabId || t.id === tabId)
      const next = prev.filter(t => String(t.serialNo) !== tabId && t.id !== tabId)
      const current = new URLSearchParams(window.location.search).get('id') ?? 'all'
      if (current === tabId) {
        const leftTab = idx > 0 ? prev[idx - 1] : null
        const newActive = leftTab ? String(leftTab.serialNo) : 'all'
        setActiveTab(newActive)
      }
      return next
    })
  }, [setActiveTab])

  const handleTabSwitch = useCallback((tabId: string) => {
    setActiveTab(tabId)
  }, [setActiveTab])

  /* ─── Fetch ─── */

  const doFetch = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter === 'UNASSIGNED') {
      params.set('assigned', 'false')
    } else if (statusFilter !== 'ALL') {
      params.set('status', statusFilter)
    }
    if (classFilter !== 'ALL') params.set('classId', classFilter)
    params.set('page', String(page))
    params.set('take', String(pageSize))
    addParams(params)

    try {
      const res = await fetch(`/api/school/students?${params}`)
      if (!res.ok) { setStudents([]); setTotal(0); return }
      const data = await res.json() as {
        students: StudentRow[]
        total: number
        counts: FilterCounts
        classOptions: ClassOption[]
      }
      setStudents(data.students ?? [])
      setTotal(data.total ?? 0)
      setCounts(data.counts ?? { totalActive: 0, totalInactive: 0, totalUnassigned: 0, totalTransferred: 0 })
      setClassOptions(data.classOptions ?? [])
    } catch {
      setStudents([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, classFilter, page, addParams])

  /* Fetch on filter / page change */
  useEffect(() => {
    doFetch()
  }, [doFetch])

  /* Debounced search — reset to page 1 */
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setPage(1)
    }, 300)
  }, [])

  /* Reset page to 1 on filter change */
  const handleStatusFilter = useCallback((key: StatusFilterKey) => {
    setStatusFilter(key)
    setPage(1)
  }, [])

  const handleClassFilter = useCallback((classId: string) => {
    setClassFilter(classId)
    setPage(1)
  }, [])

  /* ─── Row click ─── */

  const handleRowClick = useCallback((s: StudentRow, e: MouseEvent) => {
    const tab: StudentTab = {
      id: s.id,
      serialNo: s.serialNo,
      firstName: s.firstName,
      lastName: s.lastName,
    }
    if (e.ctrlKey || e.metaKey) {
      openStudent(tab, false)
    } else {
      openStudent(tab, true)
    }
  }, [openStudent])

  /* ─── Resolve active tab to student id ─── */

  const resolvedStudentId = (() => {
    if (activeTab === 'all') return null
    // Check if activeTab is numeric (serialNo)
    const asNum = Number(activeTab)
    if (!isNaN(asNum)) {
      const match = openTabs.find(t => t.serialNo === asNum)
      if (match) return match.id
    }
    return activeTab
  })()

  /* ─── Render ─── */

  return (
    <div className={LIST_PAGE_CLASS} style={{ height: 'calc(100vh - 24px)' }}>
      {/* Tab bar */}
      {hasOpenTabs && (
        <div className="fixed top-0 left-0 md:left-64 right-0 z-20 border-b bg-background h-[57px]">
          <div className="flex items-stretch h-full overflow-x-auto scrollbar-none px-4 md:px-6">
            <button
              type="button"
              onClick={() => handleTabSwitch('all')}
              className={`shrink-0 flex items-center gap-2 px-4 text-sm font-medium
                border-b-2 transition-colors
                ${activeTab === 'all'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              All Students
            </button>
            {openTabs.map(t => {
              const tabKey = String(t.serialNo)
              const isActive = activeTab === tabKey || activeTab === t.id
              return (
                <div
                  key={t.id}
                  className={`shrink-0 flex items-center gap-1 pl-3 pr-1
                    border-b-2 transition-colors group
                    ${isActive
                      ? 'border-primary text-foreground bg-muted/50'
                      : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                  <button
                    type="button"
                    onClick={() => handleTabSwitch(tabKey)}
                    className="text-sm font-medium truncate max-w-[120px]"
                    title={`${t.firstName} ${t.lastName}`}
                  >
                    {t.firstName} {t.lastName}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); closeTab(tabKey) }}
                    className={`p-1 rounded transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center
                      ${isActive
                        ? 'text-foreground/60 hover:text-foreground hover:bg-muted'
                        : 'text-muted-foreground/40 hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100'}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
      {hasOpenTabs && <div className="h-[57px] shrink-0" />}

      {/* Content */}
      {activeTab === 'all' ? (
        <div className="flex flex-col gap-3 flex-1 min-h-0">
          {/* Single toolbar row: Title+count left | Search+Filter right */}
          <div className="flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 shrink-0">
              <h1 className="text-2xl font-bold tracking-tight">Students</h1>
              {total > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-primary/15 text-primary px-3 py-0.5 text-sm font-semibold">
                  {total}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={e => handleSearchChange(e.target.value)}
                  className="pl-9 w-full sm:w-48 min-h-[44px]"
                />
              </div>
              <Button variant="outline" size="icon" className="min-h-[44px] min-w-[44px] relative"
                onClick={() => setFiltersOpen(true)}>
                <SlidersHorizontal className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>

              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetContent side="right" className="w-[300px] sm:w-[340px] p-0 flex flex-col">
                  <SheetHeader className="px-5 pt-5 pb-3 border-b">
                    <SheetTitle className="text-base">Filters</SheetTitle>
                    <SheetDescription className="sr-only">Filter students by status and class</SheetDescription>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto">
                    {/* Status */}
                    <div className="px-5 py-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Status</p>
                      <div className="space-y-1">
                        {STATUS_PILLS.map(pill => {
                          const isActive = statusFilter === pill.key
                          const count = pill.countKey ? counts[pill.countKey] : null
                          return (
                            <button key={pill.key} type="button"
                              onClick={() => { handleStatusFilter(pill.key); setFiltersOpen(false) }}
                              className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors
                                ${isActive ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50 text-foreground'}`}>
                              <span>{pill.label}</span>
                              {count !== null && count > 0 && (
                                <span className={`text-xs rounded-full px-2 py-0.5 ${isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                  {count}
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Class */}
                    {classOptions.length > 0 && (
                      <div className="px-5 py-4 border-t">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Class</p>
                        <div className="space-y-1">
                          <button type="button"
                            onClick={() => { handleClassFilter('ALL'); setFiltersOpen(false) }}
                            className={`w-full flex items-center rounded-lg px-3 py-2.5 text-sm transition-colors
                              ${classFilter === 'ALL' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50 text-foreground'}`}>
                            All Classes
                          </button>
                          {classOptions.map(cls => (
                            <button key={cls.id} type="button"
                              onClick={() => { handleClassFilter(cls.id); setFiltersOpen(false) }}
                              className={`w-full flex items-center rounded-lg px-3 py-2.5 text-sm transition-colors
                                ${classFilter === cls.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50 text-foreground'}`}>
                              {cls.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {activeFilterCount > 0 && (
                    <div className="px-5 py-3 border-t">
                      <Button variant="outline" size="sm" className="w-full min-h-[40px]"
                        onClick={() => { handleStatusFilter('ALL'); handleClassFilter('ALL'); setFiltersOpen(false) }}>
                        Clear all filters
                      </Button>
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Table / States */}
          {loading && students.length === 0 ? (
            <div className="rounded-xl border bg-card divide-y">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4">
                  <div className="h-10 w-10 rounded-full bg-muted animate-pulse shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-40 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : students.length === 0 && !loading ? (
            <div className="rounded-xl border bg-card flex flex-col items-center justify-center py-20 gap-3 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <UserX className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-medium">No students found</p>
              <p className="text-sm text-muted-foreground">
                {search ? 'Try a different search term' : 'Enroll students via Admissions'}
              </p>
            </div>
          ) : (
            <div className={`flex-1 min-h-0 ${loading ? 'opacity-60 pointer-events-none transition-opacity' : ''}`}>
              <div className={TABLE_CONTAINER_CLASS + ' h-full'}>
                <table className="w-full text-sm">
                  <thead className={TABLE_HEADER_CLASS}>
                    <tr className="border-b">
                      <SortableHeader label="Student" field="firstName" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                      <SortableHeader label="Admission No" field="admissionNo" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                      <SortableHeader label="Class" field="className" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                      <SortableHeader label="Section" field="sectionName" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                      <SortableHeader label="Roll No" field="rollNo" currentField={sortField} currentDir={sortDir} onSort={handleSort} className="hidden md:table-cell" />
                      <SortableHeader label="Status" field="status" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                    </tr>
                  </thead>
                  <tbody>
                    {sortData(students, sortField, sortDir).map(s => {
                      const isOpened = openedSerials.has(s.serialNo)
                      return (
                        <tr
                          key={s.id}
                          onClick={(e) => handleRowClick(s, e)}
                          className={`border-b last:border-0 cursor-pointer transition-colors
                            ${isOpened ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/50'}`}
                        >
                          {/* Student */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {s.photoUrl ? (
                                <img
                                  src={s.photoUrl}
                                  alt={`${s.firstName} ${s.lastName}`}
                                  className="h-8 w-8 rounded-full shrink-0 object-cover"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center
                                  text-gray-800 text-xs font-bold" style={{ backgroundColor: generateColor(s.firstName) }}>
                                  {getInitials(s.firstName, s.lastName)}
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{s.firstName} {s.lastName}</span>
                                {isOpened && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                              </div>
                            </div>
                          </td>

                          {/* Admission No */}
                          <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                            {s.admissionNo}
                          </td>

                          {/* Class */}
                          <td className="px-4 py-3">
                            {s.isAssigned && s.className ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                {s.className}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                Unassigned
                              </span>
                            )}
                          </td>

                          {/* Section */}
                          <td className="px-4 py-3 text-muted-foreground">
                            {s.sectionName ?? '\u2014'}
                          </td>

                          {/* Roll No — hidden on mobile */}
                          <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                            {s.rollNo ?? '\u2014'}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                              ${s.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-700'
                                : s.status === 'INACTIVE'
                                  ? 'bg-red-100 text-red-700'
                                  : s.status === 'TRANSFERRED'
                                    ? 'bg-gray-100 text-gray-600'
                                    : 'bg-gray-100 text-gray-600'}`}>
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          )}
          <TablePagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      ) : (
        resolvedStudentId && <StudentDetailInline studentId={resolvedStudentId} />
      )}
    </div>
  )
}
