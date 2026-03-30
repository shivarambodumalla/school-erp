'use client'

import { useState, useEffect, useCallback, type MouseEvent } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import {
  Plus, Search, SlidersHorizontal,
  GraduationCap, Users, LayoutGrid, LayoutList, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { AddClassSheet } from './AddClassSheet'
import { ClassYearClient } from './ClassYearClient'
import type { ClassTemplate } from '../types'

const MAX_TABS = 10
const STATUS_OPTIONS = ['ACTIVE', 'ARCHIVED', 'DRAFT']

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-gray-100 text-gray-600',
  DRAFT: 'bg-amber-100 text-amber-700',
}

type ViewMode = 'table' | 'cards'

interface ClassTab {
  id: string
  serialNo: number
  name: string
  gradeLevel: number
}

interface ClassYearDetail {
  id: string
  status: string
  classTemplate: { name: string; gradeLevel: number }
  academicYear: { name: string }
  sections: { id: string; name: string; maxStrength: number | null; classTeacherId: string | null; _count: { students: number } }[]
  _count: { sections: number; subjects: number }
}

export function ClassesClient() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { apiParam } = useInstitutionId()

  const [classes, setClasses] = useState<ClassTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [statuses, setStatuses] = useState<string[]>([])
  const [view, setView] = useState<ViewMode>('cards')

  // Tab state
  const urlTabId = searchParams.get('id')
  const [activeTab, setActiveTab] = useState(urlTabId ?? 'all')
  const [openTabs, setOpenTabs] = useState<ClassTab[]>([])
  const [classYearCache, setClassYearCache] = useState<Record<string, ClassYearDetail>>({})
  const hasOpenTabs = openTabs.length > 0
  const openedIds = new Set(openTabs.map(t => t.id))

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

  const fetchClasses = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/school/classes${apiParam}`)
      if (res.ok) {
        const data = (await res.json()) as ClassTemplate[]
        setClasses(data)
      }
    } catch {
      /* handled by empty state */
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchClasses() }, [fetchClasses])

  const fetchClassYear = useCallback(async (classYearId: string) => {
    try {
      const res = await fetch(`/api/school/classes/${classYearId}${apiParam}`)
      if (res.ok) {
        const data = await res.json() as ClassYearDetail
        setClassYearCache(prev => ({ ...prev, [classYearId]: data }))
      }
    } catch {
      // silently fail
    }
  }, [apiParam])

  const toggleStatus = (s: string) => {
    setStatuses(prev =>
      prev.includes(s) ? prev.filter(v => v !== s) : [...prev, s],
    )
  }

  const activeFilterCount = statuses.length

  const filtered = classes.filter(cls => {
    const status = cls.activeYear?.status ?? 'DRAFT'
    const matchesStatus = statuses.length === 0 || statuses.includes(status)
    const matchesSearch = search === '' ||
      cls.name.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const totalSections = classes.reduce(
    (sum, c) => sum + (c.activeYear?.sectionCount ?? 0), 0
  )
  const totalStudents = classes.reduce(
    (sum, c) => sum + (c.activeYear?.studentCount ?? 0), 0
  )

  const openClass = useCallback((tab: ClassTab, navigate: boolean) => {
    setOpenTabs(prev => {
      if (prev.some(t => t.id === tab.id)) return prev
      const next = [...prev, tab]
      if (next.length > MAX_TABS) next.shift()
      return next
    })
    if (!classYearCache[tab.id]) {
      fetchClassYear(tab.id)
    }
    if (navigate) {
      setActiveTab(String(tab.serialNo))
      updateUrl(String(tab.serialNo))
    }
  }, [updateUrl, classYearCache, fetchClassYear])

  const closeTab = useCallback((tabKey: string) => {
    setOpenTabs(prev => {
      const idx = prev.findIndex(t => String(t.serialNo) === tabKey)
      const next = prev.filter(t => String(t.serialNo) !== tabKey)
      setActiveTab(current => {
        if (current !== tabKey) return current
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

  const handleClick = useCallback((cls: ClassTemplate, e: MouseEvent) => {
    if (!cls.activeYear) return
    const tab: ClassTab = {
      id: cls.activeYear.id,
      serialNo: cls.activeYear.serialNo,
      name: cls.name,
      gradeLevel: cls.gradeLevel,
    }
    if (e.ctrlKey || e.metaKey) {
      openClass(tab, false)
    } else {
      openClass(tab, true)
    }
  }, [openClass])

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
              All Classes
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
                  title={t.name}>
                  {t.name}
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
        <div className="space-y-6 pt-1">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="text-2xl font-bold tracking-tight shrink-0">Classes</h1>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2
                  h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 w-full sm:w-44" />
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
                        <span className="text-sm">{s.charAt(0) + s.slice(1).toLowerCase()}</span>
                      </label>
                    ))}
                  </div>
                  {statuses.length > 0 && (
                    <div className="px-3 py-2 border-t">
                      <button type="button" onClick={() => setStatuses([])}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                        Clear all
                      </button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
              {/* View toggle */}
              <div className="flex gap-0.5 border rounded-lg p-0.5">
                <Button variant={view === 'table' ? 'default' : 'ghost'}
                  size="icon" className="h-9 w-9"
                  onClick={() => setView('table')}>
                  <LayoutList className="h-4 w-4" />
                </Button>
                <Button variant={view === 'cards' ? 'default' : 'ghost'}
                  size="icon" className="h-9 w-9"
                  onClick={() => setView('cards')}>
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={() => setSheetOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> <span className="hidden sm:inline">Add Class</span><span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <StatCard icon={<GraduationCap className="h-5 w-5" />}
              label="Total Classes" value={classes.length} loading={loading} />
            <StatCard icon={<LayoutGrid className="h-5 w-5" />}
              label="Total Sections" value={totalSections} loading={loading} />
            <StatCard icon={<Users className="h-5 w-5" />}
              label="Total Students" value={totalStudents} loading={loading} />
          </div>

          {/* Classes — Table or Cards */}
          {loading ? (
            view === 'cards' ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border divide-y">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-4">
                    <div className="h-9 w-9 rounded-lg bg-muted animate-pulse shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-40 rounded bg-muted animate-pulse" />
                      <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border bg-card p-12 text-center space-y-2">
              <p className="font-medium">No classes found</p>
              <p className="text-sm text-muted-foreground">
                {search ? 'Try a different search term' : 'Add your first class to get started.'}
              </p>
            </div>
          ) : view === 'cards' ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(cls => {
                const status = cls.activeYear?.status ?? 'DRAFT'
                const hasYear = !!cls.activeYear
                const isOpened = cls.activeYear ? openedIds.has(cls.activeYear.id) : false
                return (
                  <button key={cls.id} type="button"
                    onClick={(e) => handleClick(cls, e)}
                    disabled={!hasYear}
                    className={`rounded-xl border bg-card p-5 space-y-4 text-left w-full
                      transition-all hover:shadow-md
                      ${!hasYear ? 'opacity-60 cursor-default' : 'cursor-pointer'}
                      ${isOpened ? 'ring-2 ring-primary/30 bg-primary/5' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary
                        flex items-center justify-center text-lg font-bold shrink-0">
                        {cls.gradeLevel}
                      </div>
                      <Badge variant="secondary" className={STATUS_COLORS[status] ?? ''}>
                        {status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-lg leading-tight">{cls.name}</p>
                      {isOpened && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <LayoutGrid className="h-3.5 w-3.5" />
                        {cls.activeYear?.sectionCount ?? 0} sections
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {cls.activeYear?.studentCount ?? 0} students
                      </span>
                    </div>
                    {!hasYear && (
                      <p className="text-xs text-muted-foreground">No active year linked</p>
                    )}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="rounded-xl border overflow-auto max-h-[calc(100vh-380px)]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-[1] bg-muted/95 backdrop-blur-sm">
                  <tr className="border-b">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Class</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Grade</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Sections</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Students</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(cls => {
                    const status = cls.activeYear?.status ?? 'DRAFT'
                    const hasYear = !!cls.activeYear
                    const isOpened = cls.activeYear ? openedIds.has(cls.activeYear.id) : false
                    return (
                      <tr key={cls.id}
                        onClick={(e) => handleClick(cls, e)}
                        className={`border-b last:border-0 transition-colors
                          ${hasYear ? 'cursor-pointer' : 'opacity-60'}
                          ${isOpened ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/50'}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary
                              flex items-center justify-center text-sm font-bold shrink-0">
                              {cls.gradeLevel}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{cls.name}</span>
                              {isOpened && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{cls.gradeLevel}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                          {cls.activeYear?.sectionCount ?? 0}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                          {cls.activeYear?.studentCount ?? 0}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary" className={STATUS_COLORS[status] ?? ''}>
                            {status}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          <AddClassSheet
            open={sheetOpen}
            onClose={() => setSheetOpen(false)}
            onCreated={fetchClasses}
          />
        </div>
      ) : (() => {
          const cuid = openTabs.find(t => String(t.serialNo) === activeTab)?.id ?? activeTab
          return classYearCache[cuid] ? (
            <ClassYearClient classYear={classYearCache[cuid]} />
          ) : (
            <div className="flex items-center justify-center h-40">
              <div className="h-8 w-8 animate-spin rounded-full
                border-4 border-primary border-t-transparent" />
            </div>
          )
        })()}
    </div>
  )
}

function StatCard({ icon, label, value, loading }: {
  icon: React.ReactNode
  label: string
  value: number
  loading: boolean
}) {
  return (
    <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary
        flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        {loading ? (
          <div className="h-6 w-10 rounded bg-muted animate-pulse" />
        ) : (
          <p className="text-xl font-bold">{value}</p>
        )}
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
