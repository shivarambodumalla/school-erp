'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Users } from 'lucide-react'
import { generateColor } from '@/lib/colors'

interface SubjectMiniLeftNavProps {
  subjectId: string
  classSerialNo: number
  subject: {
    name: string
    code: string | null
    color: string
    teachers: { email: string; isPrimary: boolean }[]
    section: string | null
  }
}

const NAV_ITEMS = [
  { label: 'Contents', suffix: '' },
  { label: 'Assessments', suffix: '/assessments' },
  { label: 'Discussions', suffix: '/discussions' },
  { label: 'Grades', suffix: '/grades' },
  { label: 'Groups', suffix: '/groups' },
  { label: 'Resources', suffix: '/resources' },
] as const

const SECONDARY_ITEMS = [
  { label: 'Analytics', suffix: '/analytics' },
  { label: 'Settings', suffix: '/settings' },
] as const

function getActiveKey(pathname: string, basePath: string): string {
  const relative = pathname.replace(basePath, '')
  if (!relative || relative === '/') return ''

  for (const item of [...SECONDARY_ITEMS, ...NAV_ITEMS]) {
    if (item.suffix && relative.startsWith(item.suffix)) return item.suffix
  }
  return ''
}

export function SubjectMiniLeftNav({
  subjectId,
  classSerialNo,
  subject,
}: SubjectMiniLeftNavProps) {
  const pathname = usePathname()
  const basePath = `/management/institution/classes/${classSerialNo}/subjects/${subjectId}`
  const activeKey = getActiveKey(pathname, basePath)

  const primaryTeacher = subject.teachers.find(t => t.isPrimary)
  const teacherName = primaryTeacher
    ? primaryTeacher.email.split('@')[0]
    : subject.teachers[0]?.email.split('@')[0] ?? null

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r sticky top-0 h-[calc(100vh-6rem)] overflow-y-auto bg-background">
      {/* Subject Hero */}
      <div className="p-5 border-b">
        {/* Color avatar + name */}
        <div className="flex items-start gap-3">
          <div
            className="h-12 w-12 rounded-xl shrink-0 flex items-center justify-center text-gray-800 text-lg font-bold"
            style={{ backgroundColor: generateColor(subject.name) }}
          >
            {subject.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold leading-tight truncate">{subject.name}</h2>
            {subject.code && (
              <span className="inline-flex items-center mt-1 rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono text-muted-foreground">
                {subject.code}
              </span>
            )}
          </div>
        </div>

        {/* Meta info */}
        <div className="mt-3 space-y-1.5">
          {teacherName && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{teacherName}</span>
            </div>
          )}
          {subject.section && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5 shrink-0" />
              <span>Section {subject.section}</span>
            </div>
          )}
        </div>
      </div>

      {/* Primary nav */}
      <nav className="flex flex-col py-2 px-2 gap-0.5 flex-1" aria-label="Subject navigation">
        {NAV_ITEMS.map(item => {
          const href = `${basePath}${item.suffix}`
          const isActive = activeKey === item.suffix
          return (
            <Link
              key={item.suffix || 'root'}
              href={href}
              className={`px-3 py-2 text-sm rounded-md transition-colors min-h-[36px] flex items-center
                ${isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
            >
              {item.label}
            </Link>
          )
        })}

        <div className="my-1.5 mx-3 border-t" />

        {SECONDARY_ITEMS.map(item => {
          const href = `${basePath}${item.suffix}`
          const isActive = activeKey === item.suffix
          return (
            <Link
              key={item.suffix}
              href={href}
              className={`px-3 py-2 text-sm rounded-md transition-colors min-h-[36px] flex items-center
                ${isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
