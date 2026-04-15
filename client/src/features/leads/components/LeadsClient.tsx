'use client'

import { useState, useEffect, useCallback, useRef, type MouseEvent } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import {
  Search, UserX, X, SlidersHorizontal, Plus, Upload,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { LeadDetailInline } from './LeadDetailInline'
import { SortableHeader, toggleSort, sortData, type SortDir } from '@/components/shared/SortableHeader'
import { TABLE_CONTAINER_CLASS, TABLE_HEADER_CLASS, DEFAULT_PAGE_SIZE, LIST_PAGE_CLASS } from '@/lib/table-constants'
import { TablePagination } from '@/components/shared/TablePagination'

/* ─── Interfaces ─── */

interface FollowUpSummary {
  scheduledAt: string
  completedAt: string | null
  channel: string
}

interface LeadRow {
  id: string
  name: string
  phone: string
  email: string | null
  status: string
  source: string
  notes: string | null
  createdAt: string
  assignedTo: { id: string; firstName: string; lastName: string } | null
  label: { id: string; name: string; color: string } | null
  targetClass: { id: string; name: string } | null
  followUps: FollowUpSummary[]
}

interface LeadTab {
  id: string
  name: string
}

interface LabelOption {
  id: string
  name: string
  color: string
}

interface StaffOption {
  id: string
  firstName: string
  lastName: string
}

/* ─── localStorage helpers ─── */

const LEAD_TABS_KEY = 'onflows-leads-open-tabs'

function loadLeadTabs(): LeadTab[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LEAD_TABS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as LeadTab[]) : []
  } catch {
    return []
  }
}

function saveLeadTabs(tabs: LeadTab[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(LEAD_TABS_KEY, JSON.stringify(tabs))
}

/* ─── Constants ─── */

const MAX_TABS = 10

type StatusFilterKey = 'ALL' | 'NEW' | 'CONTACTED' | 'INTERESTED' | 'APPLIED' | 'CONVERTED' | 'LOST'

interface StatusPill {
  key: StatusFilterKey
  label: string
}

const STATUS_PILLS: StatusPill[] = [
  { key: 'ALL', label: 'All' },
  { key: 'NEW', label: 'New' },
  { key: 'CONTACTED', label: 'Contacted' },
  { key: 'INTERESTED', label: 'Interested' },
  { key: 'APPLIED', label: 'Applied' },
  { key: 'CONVERTED', label: 'Converted' },
  { key: 'LOST', label: 'Lost' },
]

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  CONTACTED: 'bg-yellow-100 text-yellow-700',
  INTERESTED: 'bg-purple-100 text-purple-700',
  APPLIED: 'bg-indigo-100 text-indigo-700',
  CONVERTED: 'bg-green-100 text-green-700',
  LOST: 'bg-red-100 text-red-700',
}

const SOURCE_LABELS: Record<string, string> = {
  WALK_IN: 'Walk-in',
  WEBSITE: 'Website',
  SOCIAL: 'Social',
  REFERRAL: 'Referral',
  OTHER: 'Other',
}

/* ─── Main component ─── */

export function LeadsClient() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { addParams } = useInstitutionId()

  /* Data */
  const [leads, setLeads] = useState<LeadRow[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  /* Filter options */
  const [labels, setLabels] = useState<LabelOption[]>([])
  const [staffList, setStaffList] = useState<StaffOption[]>([])

  /* Filters */
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilterKey>('ALL')
  const [sourceFilter, setSourceFilter] = useState('ALL')
  const [labelFilter, setLabelFilter] = useState('ALL')
  const [assignedFilter, setAssignedFilter] = useState('ALL')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activeFilterCount =
    (statusFilter !== 'ALL' ? 1 : 0) +
    (sourceFilter !== 'ALL' ? 1 : 0) +
    (labelFilter !== 'ALL' ? 1 : 0) +
    (assignedFilter !== 'ALL' ? 1 : 0)

  /* Sort */
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)

  const handleSort = (field: string) => {
    const { field: f, dir: d } = toggleSort(field, sortField, sortDir)
    setSortField(f)
    setSortDir(d)
  }

  /* Tabs */
  const activeTab = searchParams.get('id') ?? 'all'
  const [openTabs, setOpenTabs] = useState<LeadTab[]>([])
  const [tabsLoaded, setTabsLoaded] = useState(false)
  const openedIds = new Set(openTabs.map(t => t.id))
  const hasOpenTabs = openTabs.length > 0

  useEffect(() => {
    setOpenTabs(loadLeadTabs())
    setTabsLoaded(true)
  }, [])

  useEffect(() => {
    if (tabsLoaded) saveLeadTabs(openTabs)
  }, [openTabs, tabsLoaded])

  /* ─── URL tab management ─── */

  const setActiveTab = useCallback((tabId: string) => {
    const params = new URLSearchParams(window.location.search)
    if (tabId && tabId !== 'all') params.set('id', tabId)
    else params.delete('id')
    const qs = params.toString()
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
  }, [router, pathname])

  const openLead = useCallback((tab: LeadTab, navigate: boolean) => {
    setOpenTabs(prev => {
      if (prev.some(t => t.id === tab.id)) return prev
      const next = [...prev, tab]
      if (next.length > MAX_TABS) next.shift()
      return next
    })
    if (navigate) setActiveTab(tab.id)
  }, [setActiveTab])

  const closeTab = useCallback((tabId: string) => {
    setOpenTabs(prev => {
      const idx = prev.findIndex(t => t.id === tabId)
      const next = prev.filter(t => t.id !== tabId)
      const current = new URLSearchParams(window.location.search).get('id') ?? 'all'
      if (current === tabId) {
        const leftTab = idx > 0 ? prev[idx - 1] : null
        const newActive = leftTab ? leftTab.id : 'all'
        setActiveTab(newActive)
      }
      return next
    })
  }, [setActiveTab])

  const handleTabSwitch = useCallback((tabId: string) => {
    setActiveTab(tabId)
  }, [setActiveTab])

  /* ─── Fetch leads ─── */

  const doFetch = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter !== 'ALL') params.set('status', statusFilter)
    if (sourceFilter !== 'ALL') params.set('source', sourceFilter)
    if (labelFilter !== 'ALL') params.set('labelId', labelFilter)
    if (assignedFilter !== 'ALL') params.set('assignedToId', assignedFilter)
    params.set('page', String(page))
    params.set('take', String(pageSize))
    addParams(params)

    try {
      const res = await fetch(`/api/school/leads?${params}`)
      if (!res.ok) { setLeads([]); setTotal(0); return }
      const data = await res.json() as {
        leads: LeadRow[]
        total: number
        counts: Record<string, number>
      }
      setLeads(data.leads ?? [])
      setTotal(data.total ?? 0)
      setCounts(data.counts ?? {})
    } catch {
      setLeads([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, sourceFilter, labelFilter, assignedFilter, page, pageSize, addParams])

  useEffect(() => { doFetch() }, [doFetch])

  /* Fetch labels once */
  useEffect(() => {
    const params = new URLSearchParams()
    addParams(params)
    fetch(`/api/school/leads/labels?${params}`)
      .then(r => r.json())
      .then((data: LabelOption[]) => { if (Array.isArray(data)) setLabels(data) })
      .catch(() => {})

    fetch(`/api/school/staff?${params}`)
      .then(r => r.json())
      .then((data: { staff?: StaffOption[] }) => {
        if (data.staff && Array.isArray(data.staff)) setStaffList(data.staff)
      })
      .catch(() => {})
  }, [addParams])

  /* Search debounce */
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => { setPage(1) }, 300)
  }, [])

  const handleStatusFilter = useCallback((key: StatusFilterKey) => {
    setStatusFilter(key)
    setPage(1)
  }, [])

  /* Row click */
  const handleRowClick = useCallback((lead: LeadRow, e: MouseEvent) => {
    const tab: LeadTab = { id: lead.id, name: lead.name }
    if (e.ctrlKey || e.metaKey) {
      openLead(tab, false)
    } else {
      openLead(tab, true)
    }
  }, [openLead])

  /* CSV Import */
  const handleImport = useCallback(async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      const formData = new FormData()
      formData.append('file', file)
      const params = new URLSearchParams()
      addParams(params)
      try {
        const res = await fetch(`/api/school/leads/import?${params}`, {
          method: 'POST',
          body: formData,
        })
        const result = await res.json() as { imported: number; skipped: number }
        alert(`Imported: ${result.imported}, Skipped: ${result.skipped}`)
        doFetch()
      } catch {
        alert('Import failed')
      }
    }
    input.click()
  }, [addParams, doFetch])

  /* Create new lead */
  const [showCreateSheet, setShowCreateSheet] = useState(false)

  const totalAll = Object.values(counts).reduce((a, b) => a + b, 0)

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
              All Leads
            </button>
            {openTabs.map(t => {
              const isActive = activeTab === t.id
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
                    onClick={() => handleTabSwitch(t.id)}
                    className="text-sm font-medium truncate max-w-[120px]"
                    title={t.name}
                  >
                    {t.name}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); closeTab(t.id) }}
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
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 shrink-0">
              <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
              {totalAll > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-primary/15 text-primary px-3 py-0.5 text-sm font-semibold">
                  {totalAll}
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
              <Button variant="outline" size="icon" className="min-h-[44px] min-w-[44px] hidden sm:flex"
                onClick={handleImport} title="Import CSV">
                <Upload className="h-4 w-4" />
              </Button>
              <Button className="min-h-[44px] gap-1.5" onClick={() => setShowCreateSheet(true)}>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Lead</span>
              </Button>

              {/* Filter Sheet */}
              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetContent side="right" className="w-[300px] sm:w-[340px] p-0 flex flex-col">
                  <SheetHeader className="px-5 pt-5 pb-3 border-b">
                    <SheetTitle className="text-base">Filters</SheetTitle>
                    <SheetDescription className="sr-only">Filter leads by source, label, and assignment</SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto">
                    {/* Source */}
                    <div className="px-5 py-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Source</p>
                      <div className="space-y-1">
                        <button type="button"
                          onClick={() => { setSourceFilter('ALL'); setFiltersOpen(false); setPage(1) }}
                          className={`w-full flex items-center rounded-lg px-3 py-2.5 text-sm transition-colors
                            ${sourceFilter === 'ALL' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50 text-foreground'}`}>
                          All Sources
                        </button>
                        {(['WALK_IN', 'WEBSITE', 'SOCIAL', 'REFERRAL', 'OTHER'] as const).map(s => (
                          <button key={s} type="button"
                            onClick={() => { setSourceFilter(s); setFiltersOpen(false); setPage(1) }}
                            className={`w-full flex items-center rounded-lg px-3 py-2.5 text-sm transition-colors
                              ${sourceFilter === s ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50 text-foreground'}`}>
                            {SOURCE_LABELS[s]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Label */}
                    {labels.length > 0 && (
                      <div className="px-5 py-4 border-t">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Label</p>
                        <div className="space-y-1">
                          <button type="button"
                            onClick={() => { setLabelFilter('ALL'); setFiltersOpen(false); setPage(1) }}
                            className={`w-full flex items-center rounded-lg px-3 py-2.5 text-sm transition-colors
                              ${labelFilter === 'ALL' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50 text-foreground'}`}>
                            All Labels
                          </button>
                          {labels.map(l => (
                            <button key={l.id} type="button"
                              onClick={() => { setLabelFilter(l.id); setFiltersOpen(false); setPage(1) }}
                              className={`w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors
                                ${labelFilter === l.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50 text-foreground'}`}>
                              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: l.color }} />
                              {l.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Assigned To */}
                    {staffList.length > 0 && (
                      <div className="px-5 py-4 border-t">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Assigned To</p>
                        <div className="space-y-1">
                          <button type="button"
                            onClick={() => { setAssignedFilter('ALL'); setFiltersOpen(false); setPage(1) }}
                            className={`w-full flex items-center rounded-lg px-3 py-2.5 text-sm transition-colors
                              ${assignedFilter === 'ALL' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50 text-foreground'}`}>
                            Anyone
                          </button>
                          {staffList.map(s => (
                            <button key={s.id} type="button"
                              onClick={() => { setAssignedFilter(s.id); setFiltersOpen(false); setPage(1) }}
                              className={`w-full flex items-center rounded-lg px-3 py-2.5 text-sm transition-colors
                                ${assignedFilter === s.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50 text-foreground'}`}>
                              {s.firstName} {s.lastName}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {activeFilterCount > 0 && (
                    <div className="px-5 py-3 border-t">
                      <Button variant="outline" size="sm" className="w-full min-h-[40px]"
                        onClick={() => {
                          setSourceFilter('ALL')
                          setLabelFilter('ALL')
                          setAssignedFilter('ALL')
                          setStatusFilter('ALL')
                          setFiltersOpen(false)
                          setPage(1)
                        }}>
                        Clear all filters
                      </Button>
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Status tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none shrink-0">
            {STATUS_PILLS.map(pill => {
              const isActive = statusFilter === pill.key
              const count = pill.key === 'ALL' ? totalAll : (counts[pill.key] ?? 0)
              return (
                <button
                  key={pill.key}
                  type="button"
                  onClick={() => handleStatusFilter(pill.key)}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors min-h-[36px]
                    ${isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'}`}
                >
                  {pill.label}
                  {count > 0 && (
                    <span className={`text-xs ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Table */}
          {loading && leads.length === 0 ? (
            <div className="rounded-xl border bg-card divide-y">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-40 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : leads.length === 0 && !loading ? (
            <div className="rounded-xl border bg-card flex flex-col items-center justify-center py-20 gap-3 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <UserX className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-medium">No leads found</p>
              <p className="text-sm text-muted-foreground">
                {search ? 'Try a different search term' : 'Create a lead or import from CSV'}
              </p>
            </div>
          ) : (
            <div className={`flex-1 min-h-0 ${loading ? 'opacity-60 pointer-events-none transition-opacity' : ''}`}>
              <div className={TABLE_CONTAINER_CLASS + ' h-full'}>
                <table className="w-full text-sm">
                  <thead className={TABLE_HEADER_CLASS}>
                    <tr className="border-b">
                      <SortableHeader label="Name" field="name" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                      <SortableHeader label="Phone" field="phone" currentField={sortField} currentDir={sortDir} onSort={handleSort} className="hidden sm:table-cell" />
                      <SortableHeader label="Source" field="source" currentField={sortField} currentDir={sortDir} onSort={handleSort} className="hidden md:table-cell" />
                      <SortableHeader label="Status" field="status" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                      <SortableHeader label="Class" field="targetClass" currentField={sortField} currentDir={sortDir} onSort={handleSort} className="hidden lg:table-cell" />
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">Assigned To</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground hidden xl:table-cell">Last Follow-up</th>
                      <SortableHeader label="Created" field="createdAt" currentField={sortField} currentDir={sortDir} onSort={handleSort} className="hidden md:table-cell" />
                    </tr>
                  </thead>
                  <tbody>
                    {sortData(leads, sortField, sortDir).map(lead => {
                      const isOpened = openedIds.has(lead.id)
                      const lastFollowUp = lead.followUps[0]
                      return (
                        <tr
                          key={lead.id}
                          onClick={(e) => handleRowClick(lead, e)}
                          className={`border-b last:border-0 cursor-pointer transition-colors
                            ${isOpened ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/50'}`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{lead.name}</span>
                              {lead.label && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                                  style={{ backgroundColor: `${lead.label.color}20`, color: lead.label.color }}>
                                  {lead.label.name}
                                </span>
                              )}
                              {isOpened && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                            {lead.phone}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="text-xs text-muted-foreground">
                              {SOURCE_LABELS[lead.source] ?? lead.source}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[lead.status] ?? 'bg-gray-100 text-gray-600'}`}>
                              {lead.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                            {lead.targetClass?.name ?? '\u2014'}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">
                            {lead.assignedTo
                              ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}`
                              : '\u2014'}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs hidden xl:table-cell">
                            {lastFollowUp
                              ? new Date(lastFollowUp.scheduledAt).toLocaleDateString()
                              : '\u2014'}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">
                            {new Date(lead.createdAt).toLocaleDateString()}
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
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="pb-6">
            <LeadDetailInline leadId={activeTab} onStatusChange={() => doFetch()} />
          </div>
        </div>
      )}

      {/* Create Lead Sheet */}
      {showCreateSheet && (
        <CreateLeadSheet
          onClose={() => setShowCreateSheet(false)}
          onCreated={() => { setShowCreateSheet(false); doFetch() }}
          addParams={addParams}
        />
      )}
    </div>
  )
}

/* ─── Create Lead Sheet ─── */

function CreateLeadSheet({
  onClose,
  onCreated,
  addParams,
}: {
  onClose: () => void
  onCreated: () => void
  addParams: (p: URLSearchParams) => URLSearchParams
}) {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', source: 'WALK_IN', notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Name and phone are required')
      return
    }
    setSaving(true)
    setError('')
    const params = new URLSearchParams()
    addParams(params)
    try {
      const res = await fetch(`/api/school/leads?${params}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        setError(data.error ?? 'Failed to create lead')
        return
      }
      onCreated()
    } catch {
      setError('Failed to create lead')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent side="right" className="w-[340px] sm:w-[400px] p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-3 border-b">
          <SheetTitle>New Lead</SheetTitle>
          <SheetDescription className="sr-only">Create a new lead</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>
          )}
          <div>
            <label className="text-sm font-medium mb-1 block">Name *</label>
            <Input value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Parent / student name" className="min-h-[44px]" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Phone *</label>
            <Input value={form.phone} onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+91 98765 43210" className="min-h-[44px]" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <Input value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@example.com" className="min-h-[44px]" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Source</label>
            <select value={form.source}
              onChange={e => setForm(prev => ({ ...prev, source: e.target.value }))}
              className="w-full rounded-md border px-3 py-2.5 text-sm min-h-[44px] bg-background">
              <option value="WALK_IN">Walk-in</option>
              <option value="WEBSITE">Website</option>
              <option value="SOCIAL">Social</option>
              <option value="REFERRAL">Referral</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Notes</label>
            <textarea value={form.notes}
              onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any notes..."
              rows={3}
              className="w-full rounded-md border px-3 py-2 text-sm resize-none bg-background" />
          </div>
        </div>
        <div className="px-5 py-3 border-t flex gap-2">
          <Button variant="outline" className="flex-1 min-h-[44px]" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 min-h-[44px]" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Creating...' : 'Create Lead'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
