'use client'

import { useEffect, useState, useCallback } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { Plus, Search, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { CourseCard } from './CourseCard'
import { CreateCourseForm } from './CreateCourseForm'

interface CourseItem {
  id: string
  title: string
  description: string | null
  status: string
  createdAt: string
  _count: { enrollments: number; posts: number }
}

const STATUS_OPTIONS = ['DRAFT', 'ACTIVE', 'ARCHIVED']

export function CoursesManagementClient() {
  const { iid } = useInstitutionId()
  const [courses, setCourses] = useState<CourseItem[]>([])
  const [statuses, setStatuses] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

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

  const toggleStatus = (s: string) => {
    setStatuses(prev =>
      prev.includes(s) ? prev.filter(v => v !== s) : [...prev, s],
    )
  }

  const activeFilterCount = statuses.length

  // Client-side search + multi-status filter
  const filtered = courses.filter(c => {
    const matchesStatus = statuses.length === 0 || statuses.includes(c.status)
    const matchesSearch = search === '' ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
    return matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Toolbar: Title left | Search + Filter + Add right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight shrink-0">Courses</h1>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search courses..." value={search}
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
            <Plus className="h-4 w-4 mr-1" /> New Course
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="h-8 w-8 animate-spin rounded-full
            border-4 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          No courses found.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <CourseCard key={c.id} course={c} />
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
  )
}
