'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

const FILTERS = ['All', 'DRAFT', 'ACTIVE', 'ARCHIVED']

export function CoursesManagementClient() {
  const [courses, setCourses] = useState<CourseItem[]>([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  const load = useCallback(() => {
    const qs = filter !== 'All' ? `?status=${filter}` : ''
    fetch(`/api/school/courses${qs}`)
      .then((r) => r.json())
      .then((d: { courses: CourseItem[] }) => setCourses(d.courses))
      .finally(() => setLoading(false))
  }, [filter])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage online courses
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="min-h-[44px]">
          <Plus className="h-4 w-4 mr-1" /> New Course
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium
              whitespace-nowrap min-h-[44px] transition-colors
              ${filter === f
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            {f === 'All' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="h-8 w-8 animate-spin rounded-full
            border-4 border-primary border-t-transparent" />
        </div>
      ) : courses.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          No courses found.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
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
