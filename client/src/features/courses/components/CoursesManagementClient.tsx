'use client'

import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { Plus, Search, SlidersHorizontal, BookOpen, Users, CheckCircle2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { LIST_PAGE_CLASS } from '@/lib/table-constants'
import { CourseCard } from './CourseCard'
import { CreateCourseForm } from './CreateCourseForm'
import { CourseDetailInline } from './CourseDetailInline'

/* ── Types ── */

interface CourseItem {
  id: string
  title: string
  description: string | null
  status: string
  createdAt: string
  _count: { enrollments: number; posts: number }
}

interface CourseTab {
  id: string
  name: string
}

/* ── Tab persistence ── */

const COURSE_TABS_KEY = 'onflows-course-open-tabs'
const MAX_TABS = 10

function loadCourseTabs(): CourseTab[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(COURSE_TABS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CourseTab[]
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

function saveCourseTabs(tabs: CourseTab[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(COURSE_TABS_KEY, JSON.stringify(tabs))
}

/* ── Status options ── */

const STATUS_OPTIONS = ['DRAFT', 'ACTIVE', 'ARCHIVED']

/* ── Component ── */

export function CoursesManagementClient() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { iid } = useInstitutionId()

  const [courses, setCourses] = useState<CourseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statuses, setStatuses] = useState<string[]>([])
  const [showCreate, setShowCreate] = useState(false)

  // Tab state — URL is source of truth for activeTab, localStorage for openTabs
  const activeTab = searchParams.get('id') ?? 'all'
  const [openTabs, setOpenTabs] = useState<CourseTab[]>([])
  const hasOpenTabs = openTabs.length > 0
  const [tabsLoaded, setTabsLoaded] = useState(false)

  useEffect(() => {
    setOpenTabs(loadCourseTabs())
    setTabsLoaded(true)
  }, [])

  useEffect(() => {
    if (tabsLoaded) saveCourseTabs(openTabs)
  }, [openTabs, tabsLoaded])

  const setActiveTab = useCallback((tabId: string) => {
    const params = new URLSearchParams(window.location.search)
    if (tabId && tabId !== 'all') params.set('id', tabId)
    else params.delete('id')
    const qs = params.toString()
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
  }, [router, pathname])

  /* ── Data fetching ── */

  const load = useCallback(() => {
    const params = new URLSearchParams()
    if (statuses.length === 1) params.set('status', statuses[0])
    if (iid) params.set('iid', iid)
    const qs = params.toString()
    fetch(`/api/school/courses${qs ? `?${qs}` : ''}`)
      .then((r) => r.json())
      .then((d: { courses: CourseItem[] }) => setCourses(d.courses))
      .finally(() => setLoading(false))
  }, [statuses, iid])

  useEffect(() => { load() }, [load])

  /* ── Filtering ── */

  const toggleStatus = (s: string) => {
    setStatuses(prev =>
      prev.includes(s) ? prev.filter(v => v !== s) : [...prev, s],
    )
  }

  const activeFilterCount = statuses.length

  const filtered = useMemo(() => {
    return courses.filter(c => {
      const matchesStatus = statuses.length === 0 || statuses.includes(c.status)
      const matchesSearch = search === '' ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        (c.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
      return matchesStatus && matchesSearch
    })
  }, [courses, statuses, search])

  /* ── Stats ── */

  const totalEnrollments = courses.reduce((s, c) => s + c._count.enrollments, 0)
  const activeCount = courses.filter((c) => c.status === 'ACTIVE').length

  /* ── Tab helpers ── */

  const openCourse = useCallback((tab: CourseTab, navigate: boolean) => {
    setOpenTabs(prev => {
      if (prev.some(t => t.id === tab.id)) {
        if (navigate) setActiveTab(tab.id)
        return prev
      }
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

  const handleCourseClick = useCallback((course: CourseItem, e: MouseEvent) => {
    const tab: CourseTab = { id: course.id, name: course.title }
    if (e.ctrlKey || e.metaKey) {
      openCourse(tab, false)
    } else {
      openCourse(tab, true)
    }
  }, [openCourse])

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
              All Courses
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight shrink-0">Courses</h1>
              {courses.length > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-primary/15 text-primary px-3 py-0.5 text-sm font-semibold">
                  {courses.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search courses..." value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 w-full sm:w-48 min-h-[44px]" />
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
              <Button onClick={() => setShowCreate(true)} className="min-h-[44px]">
                <Plus className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">New Course</span>
              </Button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
            <StatCard icon={BookOpen} label="Total Courses" value={courses.length} />
            <StatCard icon={Users} label="Total Enrollments" value={totalEnrollments} />
            <StatCard icon={CheckCircle2} label="Active Courses" value={activeCount} />
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-52 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <BookOpen className="h-12 w-12" />
              <p className="font-medium text-foreground">No courses found</p>
              <p className="text-sm">Create your first course to get started</p>
              <Button onClick={() => setShowCreate(true)} variant="outline" className="gap-1.5 mt-2">
                <Plus className="h-4 w-4" /> New Course
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c) => (
                <CourseCard key={c.id} course={c}
                  onClick={(e) => handleCourseClick(c, e)} />
              ))}
            </div>
          )}

          {showCreate && (
            <CreateCourseForm
              onClose={() => setShowCreate(false)}
              onCreated={() => { setShowCreate(false); load() }}
            />
          )}
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <CourseDetailInline courseId={activeTab} />
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
