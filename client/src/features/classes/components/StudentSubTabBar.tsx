'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ExternalLink } from 'lucide-react'

interface Props {
  classYearId: string
  studentId: string
}

const TABS = [
  { key: 'overview', label: 'Overview', suffix: '' },
  { key: 'grades', label: 'Grades', suffix: '/grades' },
  { key: 'attendance', label: 'Attendance', suffix: '/attendance' },
] as const

function getActiveTab(pathname: string, basePath: string): string {
  const relative = pathname.replace(basePath, '')
  if (relative.startsWith('/grades')) return 'grades'
  if (relative.startsWith('/attendance')) return 'attendance'
  return 'overview'
}

export function StudentSubTabBar({ classYearId, studentId }: Props) {
  const pathname = usePathname()
  const basePath = `/management/institution/classes/${classYearId}/students/${studentId}`
  const active = getActiveTab(pathname, basePath)

  return (
    <div className="flex items-center gap-1 border-b">
      {TABS.map(tab => (
        <Link key={tab.key}
          href={`${basePath}${tab.suffix}`}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors min-h-[44px]
            ${active === tab.key
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}>
          {tab.label}
        </Link>
      ))}
      <Link
        href={`/management/students/${studentId}`}
        className="ml-auto flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground
          hover:text-foreground transition-colors min-h-[44px]">
        Full Profile <ExternalLink className="h-3 w-3" />
      </Link>
    </div>
  )
}
