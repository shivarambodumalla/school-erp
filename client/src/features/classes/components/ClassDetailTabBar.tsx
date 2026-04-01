'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

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

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-orange-500',
  'bg-rose-500', 'bg-cyan-500', 'bg-fuchsia-500', 'bg-amber-500',
  'bg-teal-500', 'bg-indigo-500', 'bg-lime-500', 'bg-pink-500',
]

export function ClassDetailTabBar({ serialNo, className, gradeLevel }: ClassDetailTabBarProps) {
  const pathname = usePathname()
  const basePath = `/management/institution/classes/${serialNo}`
  const avatarColor = AVATAR_COLORS[gradeLevel % AVATAR_COLORS.length]

  return (
    <div className="bg-background fixed top-0 left-0 md:left-64 right-0 z-20 border-b h-[57px] flex items-center">
      <div className="flex items-center px-4 md:px-6 w-full">
        {/* Class avatar + name — left */}
        <Link
          href={basePath}
          className="flex items-center gap-2.5 shrink-0"
        >
          <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-white text-xs font-bold ${avatarColor}`}>
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
