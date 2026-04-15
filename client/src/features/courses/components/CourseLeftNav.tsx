'use client'

import { usePathname, useRouter } from 'next/navigation'
import {
  BookOpen, Users, Settings, FileText,
} from 'lucide-react'
import { COURSE_STATUS_COLORS } from '@/lib/colors'

interface CourseInfo {
  id: string
  title: string
  description: string | null
  status: string
  enrollmentCount: number
  postCount: number
}

interface Props {
  course: CourseInfo
}

const NAV_ITEMS = [
  { key: 'content', label: 'Content', icon: FileText, suffix: '' },
  { key: 'students', label: 'Students', icon: Users, suffix: '/students' },
  { key: 'settings', label: 'Settings', icon: Settings, suffix: '/settings' },
] as const

function getActiveNav(pathname: string, basePath: string): string {
  const rel = pathname.replace(basePath, '')
  if (rel.startsWith('/students')) return 'students'
  if (rel.startsWith('/settings')) return 'settings'
  return 'content'
}

export function CourseLeftNav({ course }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const basePath = `/management/courses/${course.id}`
  const active = getActiveNav(pathname, basePath)
  const statusClass = COURSE_STATUS_COLORS[course.status] ?? COURSE_STATUS_COLORS.DRAFT

  return (
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
          <span>{course.enrollmentCount} enrolled</span>
          <span>{course.postCount} posts</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const isActive = active === item.key
          const Icon = item.icon
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => router.push(`${basePath}${item.suffix}`)}
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
  )
}
