'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  classYearId: string
  subjectId: string
}

const TABS = [
  { key: 'stream', label: 'Stream', suffix: '' },
  { key: 'classwork', label: 'Classwork', suffix: '/classwork' },
  { key: 'gradebook', label: 'Gradebook', suffix: '/gradebook' },
] as const

function getActiveTab(pathname: string, basePath: string): string {
  const relative = pathname.replace(basePath, '')
  if (relative.startsWith('/classwork')) return 'classwork'
  if (relative.startsWith('/gradebook')) return 'gradebook'
  return 'stream'
}

export function SubjectSubTabBar({ classYearId, subjectId }: Props) {
  const pathname = usePathname()
  const basePath = `/management/institution/classes/${classYearId}/subjects/${subjectId}`
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
    </div>
  )
}
