'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, BookOpen, ChevronDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CLASS_STATUS_COLORS } from '@/lib/colors'

interface ClassYearSummary {
  id: string
  classTemplate: { name: string; gradeLevel: number }
  academicYear: { name: string }
  _count: { sections: number; subjects: number; studentSections: number }
  status: string
}

interface ClassSwitcherItem {
  id: string
  serialNo: number
  classTemplate: { name: string; gradeLevel: number }
  academicYear: { name: string }
}

interface ClassPageLeftPanelProps {
  classYear: ClassYearSummary
  allClasses: ClassSwitcherItem[]
  classYearId: string
}

const NAV_ITEMS = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard, suffix: '' },
  { key: 'students', label: 'Students', icon: Users, suffix: '/students' },
  { key: 'subjects', label: 'Subjects', icon: BookOpen, suffix: '/subjects' },
] as const

function getActiveNav(pathname: string, basePath: string): string {
  const relative = pathname.replace(basePath, '')
  if (relative.startsWith('/students')) return 'students'
  if (relative.startsWith('/subjects')) return 'subjects'
  if (relative.startsWith('/gradebook')) return 'gradebook'
  return 'overview'
}

function getCurrentSection(pathname: string, basePath: string): string {
  const relative = pathname.replace(basePath, '')
  if (relative.startsWith('/students')) return '/students'
  if (relative.startsWith('/subjects')) return '/subjects'
  if (relative.startsWith('/gradebook')) return '/gradebook'
  return ''
}

export function ClassPageLeftPanel({
  classYear,
  allClasses,
  classYearId,
}: ClassPageLeftPanelProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [switcherOpen, setSwitcherOpen] = useState(false)

  const basePath = `/management/institution/classes/${classYearId}`
  const activeNav = getActiveNav(pathname, basePath)
  const { classTemplate, academicYear, status, _count } = classYear
  const statusClass = CLASS_STATUS_COLORS[status] ?? CLASS_STATUS_COLORS.DRAFT

  const handleNavClick = (suffix: string) => {
    router.push(`${basePath}${suffix}`)
  }

  const handleClassSwitch = (newClassId: string) => {
    const section = getCurrentSection(pathname, basePath)
    const newBasePath = `/management/institution/classes/${newClassId}`
    router.push(`${newBasePath}${section}`)
    setSwitcherOpen(false)
  }

  return (
    <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r bg-background sticky top-0 h-screen">
      {/* Overview Card */}
      <div className="p-4 border-b">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
            {classTemplate.gradeLevel}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold truncate">{classTemplate.name}</h2>
            <p className="text-xs text-muted-foreground truncate">{academicYear.name}</p>
          </div>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0 ${statusClass}`}
          >
            {status}
          </span>
        </div>

        {/* Mini stat pills */}
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1">
            {_count.sections} Sections
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1">
            {_count.studentSections} Students
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1">
            {_count.subjects} Subjects
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = activeNav === item.key
          const Icon = item.icon
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleNavClick(item.suffix)}
              className={`w-full flex items-center gap-3 px-4 min-h-[44px] text-sm transition-colors ${
                isActive
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

      {/* Class Switcher */}
      <div className="border-t p-3">
        <Popover open={switcherOpen} onOpenChange={setSwitcherOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center justify-between gap-2 rounded-md border px-3 min-h-[44px] text-sm hover:bg-muted/50 transition-colors"
            >
              <span className="truncate font-medium">{classTemplate.name}</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" side="top" className="w-64 p-1 max-h-72 overflow-y-auto">
            {allClasses.map((cls) => (
              <button
                key={cls.id}
                type="button"
                onClick={() => handleClassSwitch(String(cls.serialNo))}
                className={`w-full flex flex-col items-start rounded-md px-3 min-h-[44px] py-2 text-sm transition-colors ${
                  cls.id === classYearId
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                <span className="truncate w-full text-left">{cls.classTemplate.name}</span>
                <span className="text-xs text-muted-foreground">{cls.academicYear.name}</span>
              </button>
            ))}
          </PopoverContent>
        </Popover>
      </div>
    </aside>
  )
}
