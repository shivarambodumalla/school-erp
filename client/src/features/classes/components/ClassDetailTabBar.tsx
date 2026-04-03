'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { generateColor } from '@/lib/colors'

interface ClassDetailTabBarProps {
  serialNo: number
  className: string
  gradeLevel: number
}

const TABS = [
  { label: 'Overview', suffix: '' },
  { label: 'Students', suffix: '/students' },
  { label: 'Subjects', suffix: '/subjects' },
  { label: 'Attendance', suffix: '/attendance' },
  { label: 'Gradebook', suffix: '/gradebook' },
  { label: 'Groups', suffix: '/groups' },
  { label: 'Settings', suffix: '/settings' },
] as const

export function ClassDetailTabBar({ serialNo, className, gradeLevel }: ClassDetailTabBarProps) {
  const pathname = usePathname()
  const basePath = `/management/institution/classes/${serialNo}`
  const avatarColor = generateColor(className || String(gradeLevel))

  return (
    <div className="bg-background fixed top-0 left-0 md:left-64 right-0 z-20 border-b h-[57px] flex items-center">
      <div className="flex items-center px-4 md:px-6 w-full">
        {/* Class avatar + name — left */}
        <Link
          href={basePath}
          className="flex items-center gap-2.5 shrink-0"
        >
          <div className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-800 text-xs font-bold" style={{ backgroundColor: avatarColor }}>
            {gradeLevel}
          </div>
          <span className="text-sm font-bold text-foreground">{className}</span>
        </Link>

        {/* Tab items — pushed to the right */}
        <div className="flex items-center gap-1 ml-auto overflow-x-auto scrollbar-none whitespace-nowrap">
          {TABS.map((tab) => {
            const href = `${basePath}${tab.suffix}`
            const isActive = tab.suffix === ''
              ? pathname === basePath || pathname === `${basePath}/`
              : pathname.startsWith(href)

            return (
              <Link
                key={tab.label}
                href={href}
                className={`inline-flex items-center px-3.5 py-1.5 text-sm rounded-lg transition-colors min-h-[36px] ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
