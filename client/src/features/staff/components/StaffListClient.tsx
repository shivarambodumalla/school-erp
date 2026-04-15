'use client'

import { useState, useEffect, useCallback, useRef, type MouseEvent } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import {
  Search, Plus, UserX, X, SlidersHorizontal,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'
import { AddStaffSheet } from './AddStaffSheet'
import { StaffDetailInline } from './StaffDetailInline'
import { TABLE_CONTAINER_CLASS, TABLE_HEADER_CLASS, LIST_PAGE_CLASS } from '@/lib/table-constants'
import { TablePagination } from '@/components/shared/TablePagination'
import { SortableHeader, toggleSort, sortData, type SortDir } from '@/components/shared/SortableHeader'
import type { StaffListItem } from '../types'

interface StaffTab {
  id: string
  serialNo: number
  firstName: string
  lastName: string
  employeeNo: string
}

const STAFF_TABS_KEY = 'onflows-staff-open-tabs'

function loadStaffTabs(): StaffTab[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STAFF_TABS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as StaffTab[]
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

function saveStaffTabs(tabs: StaffTab[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STAFF_TABS_KEY, JSON.stringify(tabs))
}

const MAX_TABS = 10

import { generateColor, getInitials, STAFF_STATUS_COLORS } from '@/lib/colors'

const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED']

export function StaffListClient() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { addParams } = useInstitutionId()

  const [staff, setStaff] = useState<StaffListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [initialLoad, setInitialLoad] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [search, setSearch] = useState('')
  const [statuses, setStatuses] = useState<string[]>([])
  const [sheetOpen, setSheetOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Tab state — activeTab derived from URL, openTabs persisted to localStorage
  const activeTab = searchParams.get('id') ?? 'all'
  const [openTabs, setOpenTabs] = useState<StaffTab[]>([])
  const openedIds = new Set(openTabs.map(t => t.id))
  const hasOpenTabs = openTabs.length > 0

  const activeFilterCount = statuses.length

  const [tabsLoaded, setTabsLoaded] = useState(false)

  useEffect(() => {
    setOpenTabs(loadStaffTabs())
    setTabsLoaded(true)
  }, [])

  useEffect(() => {
    if (tabsLoaded) saveStaffTabs(openTabs)
  }, [openTabs, tabsLoaded])

  const setActiveTab = useCallback((tabId: string) => {
    const params = new URLSearchParams(window.location.search)
    if (tabId && tabId !== 'all') params.set('id', tabId)
    else params.delete('id')
    const qs = params.toString()
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
  }, [router, pathname])

  const doFetch = useCallback(async (s: string, st: string[], p: number, ps: number) => {
    setFetching(true)
    try {
      const params = new URLSearchParams()
      if (s) params.set('search', s)
      if (st.length === 1) params.set('status', st[0])
      params.set('page', String(p))
      params.set('pageSize', String(ps))
      addParams(params)
      const res = await fetch(`/api/school/staff?${params}`)
      if (!res.ok) { setStaff([]); setTotal(0); return }
      const data = await res.json() as { staff: StaffListItem[]; total: number }
      setStaff(data.staff ?? [])
      setTotal(data.total ?? 0)
    } catch {
      setStaff([]); setTotal(0)
    } finally {
      setFetching(false)
      setInitialLoad(false)
    }
  }, [addParams])

  // Fetch immediately on page/pageSize/statuses change
  useEffect(() => {
    doFetch(search, statuses, page, pageSize)
  }, [page, pageSize, statuses]) // eslint-disable-line react-hooks/exhaustive-deps

  // Debounce search — reset to page 1
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setPage(1)
      doFetch(search, statuses, 1, pageSize)
    }, 300)
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current) }
  }, [search]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleStatus = (s: string) => {
    setStatuses(prev =>
      prev.includes(s) ? prev.filter(v => v !== s) : [...prev, s],
    )
    setPage(1)
  }

  const openStaff = useCallback((tab: StaffTab, navigate: boolean) => {
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

  const closeTab = useCallback((serialNo: string) => {
    setOpenTabs(prev => {
      const idx = prev.findIndex(t => String(t.serialNo) === serialNo)
      const next = prev.filter(t => String(t.serialNo) !== serialNo)
      const current = new URLSearchParams(window.location.search).get('id') ?? 'all'
      if (current === serialNo) {
        const leftTab = idx > 0 ? prev[idx - 1] : null
        const newActive = leftTab ? String(leftTab.serialNo) : 'all'
        setActiveTab(newActive)
      }
      return next
    })
  }, [setActiveTab])

  const handleTabSwitch = useCallback((tabKey: string) => {
    setActiveTab(tabKey)
  }, [setActiveTab])

  const handleRowClick = useCallback((s: StaffListItem, e: MouseEvent) => {
    const tab: StaffTab = {
      id: s.id, serialNo: s.serialNo, firstName: s.firstName,
      lastName: s.lastName, employeeNo: s.employeeNo,
    }
    if (e.ctrlKey || e.metaKey) {
      openStaff(tab, false)
    } else {
      openStaff(tab, true)
    }
  }, [openStaff])

  return (
    <div className={LIST_PAGE_CLASS} style={{ height: 'calc(100vh - 24px)' }}>
      {/* Tab bar */}
      {hasOpenTabs && (
        <div className="fixed top-0 left-0 md:left-64 right-0 z-20 border-b bg-background h-[57px]">
          <div className="flex items-stretch h-full overflow-x-auto scrollbar-none px-4 md:px-6">
            <button type="button" onClick={() => handleTabSwitch('all')}
              className={`shrink-0 flex items-center gap-2 px-4 text-sm font-medium
                border-b-2 transition-colors
                ${activeTab === 'all'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}>
              All Staff
            </button>
            {openTabs.map(t => {
              const tabKey = String(t.serialNo)
              const isActive = activeTab === tabKey
              return (
              <div key={t.id}
                className={`shrink-0 flex items-center gap-1 pl-3 pr-1
                  border-b-2 transition-colors group
                  ${isActive
                    ? 'border-primary text-foreground bg-muted/50'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}>
                <button type="button"
                  onClick={() => handleTabSwitch(tabKey)}
                  className="text-sm font-medium truncate max-w-[120px]"
                  title={`${t.firstName} ${t.lastName} — ${t.employeeNo}`}>
                  {t.firstName} {t.lastName}
                </button>
                <button type="button"
                  onClick={(e) => { e.stopPropagation(); closeTab(tabKey) }}
                  className={`p-1 rounded transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center
                    ${isActive
                      ? 'text-foreground/60 hover:text-foreground hover:bg-muted'
                      : 'text-muted-foreground/40 hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100'
                    }`}>
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
          {/* Toolbar: Title left | Search + Filter + Add right */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight shrink-0">Staff</h1>
              {total > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-primary/15 text-primary px-3 py-0.5 text-sm font-semibold">
                  {total}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2
                  h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search staff..." value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 w-full sm:w-48" />
              </div>
              <Button variant="outline" size="icon" className="min-h-[44px] min-w-[44px] relative"
                onClick={() => setFiltersOpen(true)} aria-label="Open filters">
                <SlidersHorizontal className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary
                    text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetContent side="right" className="w-[300px] sm:w-[340px] p-0 flex flex-col">
                  <SheetHeader className="px-5 pt-5 pb-3 border-b">
                    <SheetTitle className="text-base">Filters</SheetTitle>
                    <SheetDescription className="sr-only">Filter staff by status</SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Status</p>
                    <div className="space-y-0.5">
                      {STATUS_OPTIONS.map(s => (
                        <label key={s}
                          className="flex items-center gap-2.5 px-2 py-2.5 rounded-md
                            hover:bg-muted/50 cursor-pointer transition-colors min-h-[44px]">
                          <Checkbox
                            checked={statuses.includes(s)}
                            onCheckedChange={() => toggleStatus(s)}
                          />
                          <span className="text-sm">{s.replace('_', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {statuses.length > 0 && (
                    <div className="px-5 py-3 border-t">
                      <Button variant="outline" size="sm" className="w-full min-h-[40px]"
                        onClick={() => { setStatuses([]); setPage(1); setFiltersOpen(false) }}>
                        Clear all filters
                      </Button>
                    </div>
                  )}
                </SheetContent>
              </Sheet>
              <Button onClick={() => setSheetOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> <span className="hidden sm:inline">Add Staff</span><span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>

          {/* List */}
          {initialLoad ? (
            <LoadingSkeleton />
          ) : staff.length === 0 && !fetching ? (
            <EmptyState search={search} />
          ) : (
            <div className={fetching ? 'opacity-60 pointer-events-none transition-opacity' : ''}>
              <StaffTable staff={staff} openedIds={openedIds}
                onRowClick={handleRowClick} />

              <TablePagination page={page} pageSize={pageSize} total={total}
                onPageChange={setPage} onPageSizeChange={setPageSize} />
            </div>
          )}

          <AddStaffSheet
            open={sheetOpen}
            onOpenChange={setSheetOpen}
            onCreated={() => doFetch(search, statuses, page, pageSize)}
          />
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="pb-6">
            <StaffDetailInline staffId={openTabs.find(t => String(t.serialNo) === activeTab)?.id ?? activeTab} />
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Sub-components ──────────────────────────────────────── */

function StaffTable({ staff, openedIds, onRowClick }: {
  staff: StaffListItem[]
  openedIds: Set<string>
  onRowClick: (s: StaffListItem, e: MouseEvent<HTMLTableRowElement>) => void
}) {
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)

  const handleSort = (field: string) => {
    const { field: f, dir: d } = toggleSort(field, sortField, sortDir)
    setSortField(f)
    setSortDir(d)
  }

  // Flatten nested fields for sorting
  const sortable = staff.map(s => ({
    ...s,
    departmentName: s.department?.name ?? '',
    primaryRoleName: s.primaryRole?.name ?? '',
  }))
  const sorted = sortData(sortable, sortField === 'department' ? 'departmentName' : sortField === 'primaryRole' ? 'primaryRoleName' : sortField, sortDir)

  return (
    <div className={TABLE_CONTAINER_CLASS}>
      <table className="w-full text-sm">
        <thead className={TABLE_HEADER_CLASS}>
          <tr className="border-b">
            <SortableHeader label="Employee" field="firstName" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
            <SortableHeader label="No" field="employeeNo" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
            <SortableHeader label="Designation" field="designation" currentField={sortField} currentDir={sortDir} onSort={handleSort} className="hidden md:table-cell" />
            <SortableHeader label="Dept" field="department" currentField={sortField} currentDir={sortDir} onSort={handleSort} className="hidden lg:table-cell" />
            <SortableHeader label="Role" field="primaryRole" currentField={sortField} currentDir={sortDir} onSort={handleSort} className="hidden lg:table-cell" />
            <SortableHeader label="Status" field="status" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
          </tr>
        </thead>
        <tbody>
          {sorted.map(s => {
            const isOpened = openedIds.has(s.id)
            return (
              <tr key={s.id} onClick={(e) => onRowClick(s, e)}
                className={`border-b last:border-0 cursor-pointer transition-colors
                  ${isOpened ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/50'}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center
                      text-gray-800 text-xs font-bold" style={{ backgroundColor: generateColor(s.firstName) }}>
                      {getInitials(s.firstName, s.lastName)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{s.firstName} {s.lastName}</span>
                      {isOpened && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{s.employeeNo}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{s.designation}</td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{s.department?.name ?? '-'}</td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{s.primaryRole?.name ?? '-'}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className={STAFF_STATUS_COLORS[s.status] ?? ''}>{s.status}</Badge>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="rounded-xl border divide-y">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4">
          <div className="h-8 w-8 rounded-full bg-muted animate-pulse shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-40 rounded bg-muted animate-pulse" />
            <div className="h-3 w-24 rounded bg-muted animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ search }: { search: string }) {
  return (
    <div className="rounded-xl border bg-card flex flex-col items-center
      justify-center py-20 gap-3 text-center">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
        <UserX className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="font-medium">No staff found</p>
      <p className="text-sm text-muted-foreground">
        {search ? 'Try a different search term' : 'Add your first staff member'}
      </p>
    </div>
  )
}
