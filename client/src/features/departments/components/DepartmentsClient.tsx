'use client'

import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Plus, Search, LayoutGrid, List, Building2, Users, CheckCircle2, X, SlidersHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { Input } from '@/components/ui/input'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { LIST_PAGE_CLASS } from '@/lib/table-constants'
import type { Department, DepartmentStatus, ViewMode } from '../types'
import { DepartmentGridCard } from './DepartmentGridCard'
import { DepartmentListRow } from './DepartmentListRow'
import { DeptOrgChartModal } from './DeptOrgChartModal'
import { DeptDetailInline } from './DeptDetailInline'

/* ── Tab persistence ── */

interface DeptTab {
  id: string
  name: string
}

const DEPT_TABS_KEY = 'onflows-dept-open-tabs'

function loadDeptTabs(): DeptTab[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(DEPT_TABS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as DeptTab[]
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

function saveDeptTabs(tabs: DeptTab[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(DEPT_TABS_KEY, JSON.stringify(tabs))
}

const MAX_TABS = 10

/* ── Component ── */

export function DepartmentsClient() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const confirm = useConfirm()

  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [view, setView] = useState<ViewMode>('grid')
  const [statusFilter, setStatusFilter] = useState<DepartmentStatus>('ALL')
  const [orgChartDept, setOrgChartDept] = useState<Department | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Tab state — URL is source of truth for activeTab, localStorage for openTabs
  const activeTab = searchParams.get('id') ?? 'all'
  const [openTabs, setOpenTabs] = useState<DeptTab[]>([])
  const hasOpenTabs = openTabs.length > 0

  const [tabsLoaded, setTabsLoaded] = useState(false)

  useEffect(() => {
    setOpenTabs(loadDeptTabs())
    setTabsLoaded(true)
  }, [])

  useEffect(() => {
    if (tabsLoaded) saveDeptTabs(openTabs)
  }, [openTabs, tabsLoaded])

  const setActiveTab = useCallback((tabId: string) => {
    const params = new URLSearchParams(window.location.search)
    if (tabId && tabId !== 'all') params.set('id', tabId)
    else params.delete('id')
    const qs = params.toString()
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
  }, [router, pathname])

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await fetch('/api/school/departments')
      if (res.ok) setDepartments((await res.json()) as Department[])
    } catch {
      toast.error('Failed to load departments')
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchDepartments() }, [fetchDepartments])

  const filtered = useMemo(() => {
    let list = departments
    if (statusFilter !== 'ALL') list = list.filter((d) => d.status === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((d) =>
        d.name.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q) ||
        d.hod?.firstName.toLowerCase().includes(q) ||
        d.hod?.lastName.toLowerCase().includes(q)
      )
    }
    return list
  }, [departments, statusFilter, search])

  const totalStaff = departments.reduce((s, d) => s + d._count.staff, 0)
  const activeCount = departments.filter((d) => d.status === 'ACTIVE').length
  const activeFilterCount = statusFilter !== 'ALL' ? 1 : 0

  const handleDelete = async (dept: Department) => {
    if (dept._count.staff > 0) { toast.error('Cannot delete a department with assigned staff'); return }
    const ok = await confirm({
      title: 'Delete Department',
      description: `Delete "${dept.name}"?`,
      note: 'This action cannot be undone.',
      destructive: true,
      confirmLabel: 'Delete',
    })
    if (!ok) return
    try {
      const res = await fetch(`/api/school/departments/${dept.id}`, { method: 'DELETE' })
      if (res.ok) { toast.success(`"${dept.name}" deleted`); fetchDepartments() }
      else { const err = (await res.json()) as { error: string }; toast.error(err.error) }
    } catch { toast.error('Failed to delete department') }
  }

  const handleToggleStatus = async (dept: Department) => {
    const ns = dept.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    try {
      const res = await fetch(`/api/school/departments/${dept.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: ns }),
      })
      if (res.ok) { toast.success(`"${dept.name}" ${ns.toLowerCase()}`); fetchDepartments() }
      else { const err = (await res.json()) as { error: string }; toast.error(err.error) }
    } catch { toast.error('Failed to update department') }
  }

  /* ── Tab helpers ── */

  const openDept = useCallback((tab: DeptTab, navigate: boolean) => {
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

  const handleDeptClick = useCallback((dept: Department, e: MouseEvent) => {
    const tab: DeptTab = { id: dept.id, name: dept.name }
    if (e.ctrlKey || e.metaKey) {
      openDept(tab, false)
    } else {
      openDept(tab, true)
    }
  }, [openDept])

  /* ── Render ── */

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
              All Departments
            </button>
            {openTabs.map(t => {
              const isActive = activeTab === t.id
              return (
                <div key={t.id}
                  className={`shrink-0 flex items-center gap-1 pl-3 pr-1
                    border-b-2 transition-colors group
                    ${isActive
                      ? 'border-primary text-foreground bg-muted/50'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}>
                  <button type="button"
                    onClick={() => handleTabSwitch(t.id)}
                    className="text-sm font-medium truncate max-w-[120px]"
                    title={t.name}>
                    {t.name}
                  </button>
                  <button type="button"
                    onClick={(e) => { e.stopPropagation(); closeTab(t.id) }}
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
        <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto pb-6">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 shrink-0">
            <h1 className="text-2xl font-bold tracking-tight">Departments</h1>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-full sm:w-48 min-h-[44px]" />
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
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button onClick={() => setView('grid')} className={`p-2 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors ${view === 'grid' ? 'bg-muted' : 'hover:bg-muted/50'}`}><LayoutGrid className="h-4 w-4" /></button>
                <button onClick={() => setView('list')} className={`p-2 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors ${view === 'list' ? 'bg-muted' : 'hover:bg-muted/50'}`}><List className="h-4 w-4" /></button>
              </div>
              <Button onClick={() => router.push('/management/departments/new')} className="gap-1.5 min-h-[44px]">
                <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Add</span>
              </Button>
            </div>
          </div>

          {/* Filter drawer */}
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetContent side="right" className="w-[300px] sm:w-[340px] p-0 flex flex-col">
              <SheetHeader className="px-5 pt-5 pb-3 border-b">
                <SheetTitle className="text-base">Filters</SheetTitle>
                <SheetDescription className="sr-only">Filter departments by status</SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Status</p>
                <div className="space-y-1">
                  {(['ALL', 'ACTIVE', 'INACTIVE'] as DepartmentStatus[]).map(s => (
                    <button key={s} type="button"
                      onClick={() => { setStatusFilter(s); setFiltersOpen(false) }}
                      className={`w-full flex items-center rounded-lg px-3 py-2.5 text-sm transition-colors min-h-[44px]
                        ${statusFilter === s ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50 text-foreground'}`}>
                      {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
              {statusFilter !== 'ALL' && (
                <div className="px-5 py-3 border-t">
                  <Button variant="outline" size="sm" className="w-full min-h-[40px]"
                    onClick={() => { setStatusFilter('ALL'); setFiltersOpen(false) }}>
                    Clear all filters
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>

          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
            <StatCard icon={Building2} label="Total Departments" value={departments.length} />
            <StatCard icon={Users} label="Total Staff" value={totalStaff} />
            <StatCard icon={CheckCircle2} label="Active Departments" value={activeCount} />
          </div>

          {/* Grid / List */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <Building2 className="h-12 w-12" />
              <p className="font-medium text-foreground">No departments yet</p>
              <p className="text-sm">Create your first department to get started</p>
              <Button onClick={() => router.push('/management/departments/new')} variant="outline" className="gap-1.5 mt-2">
                <Plus className="h-4 w-4" /> Add Department
              </Button>
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((dept) => (
                <DepartmentGridCard key={dept.id} department={dept} onDelete={handleDelete} onToggleStatus={handleToggleStatus} onViewOrgChart={setOrgChartDept} onClick={(e) => handleDeptClick(dept, e)} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border divide-y">
              {filtered.map((dept) => (
                <DepartmentListRow key={dept.id} department={dept} onDelete={handleDelete} onToggleStatus={handleToggleStatus} onViewOrgChart={setOrgChartDept} onClick={(e) => handleDeptClick(dept, e)} />
              ))}
            </div>
          )}

          <DeptOrgChartModal department={orgChartDept} isOpen={!!orgChartDept} onClose={() => setOrgChartDept(null)} />
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="pb-6">
            <DeptDetailInline deptId={activeTab} />
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Icon className="h-5 w-5 text-primary" /></div>
      <div><p className="text-2xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>
    </div>
  )
}
