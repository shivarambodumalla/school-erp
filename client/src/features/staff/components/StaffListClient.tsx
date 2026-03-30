'use client'

import { useState, useEffect, useCallback, useRef, type MouseEvent } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import {
  Search, Plus, UserX, X, ChevronLeft, ChevronRight, SlidersHorizontal,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { AddStaffSheet } from './AddStaffSheet'
import { StaffDetailInline } from './StaffDetailInline'
import type { StaffListItem } from '../types'

const MAX_TABS = 10
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50]

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

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-600',
  ON_LEAVE: 'bg-yellow-100 text-yellow-700',
  TERMINATED: 'bg-red-100 text-red-700',
}

const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED']

interface StaffTab {
  id: string
  serialNo: number
  firstName: string
  lastName: string
  employeeNo: string
}

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
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Tab state
  const urlTabId = searchParams.get('id')
  const [activeTab, setActiveTab] = useState(urlTabId ?? 'all')
  const [openTabs, setOpenTabs] = useState<StaffTab[]>([])
  const openedIds = new Set(openTabs.map(t => t.id))
  const hasOpenTabs = openTabs.length > 0

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, total)
  const activeFilterCount = statuses.length

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
      updateUrl(String(tab.serialNo))
    }
  }, [updateUrl])

  const closeTab = useCallback((serialNo: string) => {
    setOpenTabs(prev => {
      const idx = prev.findIndex(t => String(t.serialNo) === serialNo)
      const next = prev.filter(t => String(t.serialNo) !== serialNo)
      setActiveTab(current => {
        if (current !== serialNo) return current
        const leftTab = idx > 0 ? prev[idx - 1] : null
        const newActive = leftTab ? String(leftTab.serialNo) : 'all'
        updateUrl(newActive === 'all' ? null : newActive)
        return newActive
      })
      return next
    })
  }, [updateUrl])

  const handleTabSwitch = useCallback((tabKey: string) => {
    setActiveTab(tabKey)
    updateUrl(tabKey === 'all' ? null : tabKey)
  }, [updateUrl])

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
    <div>
      {/* Tab bar */}
      {hasOpenTabs && (
        <div className="sticky top-0 z-10 bg-background -mt-4 md:-mt-6
          -mx-4 md:-mx-6 overflow-hidden">
          <div className="flex items-center border-b overflow-x-auto
            scrollbar-none px-4 md:px-6">
            <button type="button" onClick={() => handleTabSwitch('all')}
              className={`shrink-0 flex items-center gap-2 px-4 h-10
                text-sm font-medium border-b-2 transition-colors
                ${activeTab === 'all'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}>
              All Staff
            </button>
            {openTabs.map(t => {
              const tabKey = String(t.serialNo)
              return (
              <div key={t.id}
                className={`shrink-0 flex items-center gap-1 pl-3 pr-1
                  h-10 border-b-2 transition-colors group
                  ${activeTab === tabKey
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
                  className={`p-0.5 rounded transition-colors
                    ${activeTab === tabKey
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

      {/* Content */}
      {activeTab === 'all' ? (
        <div className="space-y-4 pt-1">
          {/* Toolbar: Title left | Search + Filter + Add right */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="text-2xl font-bold tracking-tight shrink-0">Staff</h1>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2
                  h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search staff..." value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 w-full sm:w-48" />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="min-h-[44px] min-w-[44px] relative">
                    <SlidersHorizontal className="h-4 w-4" />
                    {activeFilterCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary
                        text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-52 p-0">
                  <div className="px-3 py-2.5 border-b">
                    <p className="text-sm font-medium">Status</p>
                  </div>
                  <div className="p-2 space-y-0.5">
                    {STATUS_OPTIONS.map(s => (
                      <label key={s}
                        className="flex items-center gap-2.5 px-2 py-2 rounded-md
                          hover:bg-muted/50 cursor-pointer transition-colors">
                        <Checkbox
                          checked={statuses.includes(s)}
                          onCheckedChange={() => toggleStatus(s)}
                        />
                        <span className="text-sm">{s.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                  {statuses.length > 0 && (
                    <div className="px-3 py-2 border-t">
                      <button type="button" onClick={() => { setStatuses([]); setPage(1) }}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                        Clear all
                      </button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
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

              {/* Pagination */}
              <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-6 pt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline">Rows per page:</span><span className="sm:hidden">Per page:</span>
                  <select value={pageSize}
                    onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}
                    className="h-8 rounded-md border border-input bg-background px-1.5 text-sm
                      text-foreground appearance-auto cursor-pointer">
                    {PAGE_SIZE_OPTIONS.map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <span>{rangeStart}–{rangeEnd} of {total}</span>
                <div className="flex items-center gap-0.5">
                  <button type="button" disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                    className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30
                      disabled:cursor-not-allowed transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button type="button" disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30
                      disabled:cursor-not-allowed transition-colors">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <AddStaffSheet
            open={sheetOpen}
            onOpenChange={setSheetOpen}
            onCreated={() => doFetch(search, statuses, page, pageSize)}
          />
        </div>
      ) : (
        <StaffDetailInline staffId={openTabs.find(t => String(t.serialNo) === activeTab)?.id ?? activeTab} />
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
  return (
    <div className="rounded-xl border overflow-auto max-h-[calc(100vh-260px)]">
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-[1] bg-muted/95 backdrop-blur-sm">
          <tr className="border-b">
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Employee</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">No</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Designation</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Dept</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Role</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
          </tr>
        </thead>
        <tbody>
          {staff.map(s => {
            const isOpened = openedIds.has(s.id)
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
                <td className="px-4 py-3 text-muted-foreground">{s.employeeNo}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{s.designation}</td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{s.department?.name ?? '-'}</td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{s.primaryRole?.name ?? '-'}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className={STATUS_COLORS[s.status] ?? ''}>{s.status}</Badge>
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
