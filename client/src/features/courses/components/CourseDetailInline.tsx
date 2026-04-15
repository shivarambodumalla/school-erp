'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  BookOpen, Users, Settings, FileText,
} from 'lucide-react'
import { COURSE_STATUS_COLORS } from '@/lib/colors'
import { CourseContentTab } from './tabs/CourseContentTab'
import { CourseStudentsTab } from './tabs/CourseStudentsTab'
import { CourseSettingsTab } from './tabs/CourseSettingsTab'

interface CourseData {
  id: string
  title: string
  description: string | null
  status: string
  targetType: string
  maxEnrollment: number | null
  instructorId: string
  posts: {
    id: string
    type: string
    title: string
    description: string | null
    topicTag: string | null
    isPublished: boolean
    order: number
  }[]
  _count: { enrollments: number }
}

interface Props {
  courseId: string
}

const NAV_ITEMS = [
  { key: 'content', label: 'Content', icon: FileText },
  { key: 'students', label: 'Students', icon: Users },
  { key: 'settings', label: 'Settings', icon: Settings },
] as const

export function CourseDetailInline({ courseId }: Props) {
  const [course, setCourse] = useState<CourseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeSection, setActiveSection] = useState('content')

  const fetchCourse = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(`/api/school/courses/${courseId}`)
      if (!res.ok) throw new Error('Not found')
      setCourse(await res.json())
    } catch {
      setError(true)
    }
    setLoading(false)
  }, [courseId])

  useEffect(() => { fetchCourse() }, [fetchCourse])

  if (loading) {
    return (
      <div className="space-y-6 pt-4">
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-muted animate-pulse shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-48 rounded bg-muted animate-pulse" />
            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div className="h-64 rounded-xl bg-muted animate-pulse" />
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50
        p-6 text-center text-red-700 text-sm mt-4">
        Failed to load course. Please try again.
      </div>
    )
  }

  const statusClass = COURSE_STATUS_COLORS[course.status] ?? COURSE_STATUS_COLORS.DRAFT

  return (
    <div className="flex flex-col lg:flex-row gap-0 min-h-0 flex-1">
      {/* Left nav */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r bg-background">
        {/* Course header */}
        <div className="p-4 border-b space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold truncate">{course.title}</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${statusClass}`}>
                {course.status}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{course._count.enrollments} enrolled</span>
            <span>{course.posts.length} posts</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const isActive = activeSection === item.key
            const Icon = item.icon
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveSection(item.key)}
                className={`w-full flex items-center gap-3 px-4 min-h-[44px] text-sm transition-colors
                  ${isActive
                    ? 'border-l-2 border-primary bg-primary/5 text-foreground font-medium'
                    : 'border-l-2 border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Mobile nav */}
      <div className="flex lg:hidden border-b">
        {NAV_ITEMS.map(item => {
          const isActive = activeSection === item.key
          const Icon = item.icon
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveSection(item.key)}
              className={`flex-1 flex items-center justify-center gap-2 min-h-[44px] text-sm transition-colors
                border-b-2
                ${isActive
                  ? 'border-primary text-foreground font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          )
        })}
      </div>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 overflow-auto">
        {activeSection === 'content' && (
          <CourseContentTab courseId={courseId} initialPosts={course.posts} />
        )}
        {activeSection === 'students' && (
          <CourseStudentsTab courseId={courseId} />
        )}
        {activeSection === 'settings' && (
          <CourseSettingsTab course={course} />
        )}
      </main>
    </div>
  )
}
