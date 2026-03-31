'use client'

import { usePathname, useRouter } from 'next/navigation'
import {
  BookOpen, ClipboardList, MessageSquare, BarChart3,
  Users, FolderOpen, BookMarked, TrendingUp, Settings,
} from 'lucide-react'

interface SubjectInfo {
  id: string
  name: string
  code: string | null
  color: string
  classYear: string
  section: string | null
  teachers: { email: string; isPrimary: boolean }[]
  moduleCount: number
  announcementCount: number
}

interface Props {
  subject: SubjectInfo
  portalType: string
}

const TEACHER_NAV = [
  { key: 'contents', label: 'Contents', icon: BookOpen, suffix: '' },
  { key: 'assessments', label: 'Assessments', icon: ClipboardList, suffix: '/assessments' },
  { key: 'discussions', label: 'Discussions', icon: MessageSquare, suffix: '/discussions' },
  { key: 'grades', label: 'Grades', icon: BarChart3, suffix: '/grades' },
  { key: 'groups', label: 'Groups', icon: Users, suffix: '/groups' },
  { key: 'resources', label: 'Resources', icon: FolderOpen, suffix: '/resources' },
  { key: 'analytics', label: 'Analytics', icon: TrendingUp, suffix: '/analytics' },
  { key: 'settings', label: 'Settings', icon: Settings, suffix: '/settings' },
] as const

const STUDENT_NAV = [
  { key: 'contents', label: 'Contents', icon: BookOpen, suffix: '' },
  { key: 'assessments', label: 'Assessments', icon: ClipboardList, suffix: '/assessments' },
  { key: 'discussions', label: 'Discussions', icon: MessageSquare, suffix: '/discussions' },
  { key: 'grades', label: 'Grades', icon: BarChart3, suffix: '/grades' },
  { key: 'groups', label: 'Groups', icon: Users, suffix: '/groups' },
  { key: 'resources', label: 'Resources', icon: FolderOpen, suffix: '/resources' },
  { key: 'notebook', label: 'Notebook', icon: BookMarked, suffix: '/notebook' },
] as const

function getActiveNav(pathname: string, basePath: string): string {
  const rel = pathname.replace(basePath, '')
  if (rel.startsWith('/assessments')) return 'assessments'
  if (rel.startsWith('/discussions')) return 'discussions'
  if (rel.startsWith('/grades')) return 'grades'
  if (rel.startsWith('/groups')) return 'groups'
  if (rel.startsWith('/resources')) return 'resources'
  if (rel.startsWith('/notebook')) return 'notebook'
  if (rel.startsWith('/analytics')) return 'analytics'
  if (rel.startsWith('/settings')) return 'settings'
  if (rel.startsWith('/certificate')) return 'certificate'
  return 'contents'
}

export function SubjectLeftNav({ subject, portalType }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const basePath = `/management/subjects/${subject.id}`
  const active = getActiveNav(pathname, basePath)
  const isStudent = portalType === 'STUDENT'
  const navItems = isStudent ? STUDENT_NAV : TEACHER_NAV
  const primaryTeacher = subject.teachers.find(t => t.isPrimary)

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r bg-background">
      {/* Subject header */}
      <div className="p-4 border-b space-y-2">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ backgroundColor: subject.color }}
          >
            {subject.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold truncate">{subject.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {subject.classYear}{subject.section ? ` · ${subject.section}` : ''}
            </p>
          </div>
        </div>
        {primaryTeacher && (
          <p className="text-xs text-muted-foreground truncate">
            {primaryTeacher.email.split('@')[0]}
          </p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {navItems.map(item => {
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

      {/* Subject code */}
      {subject.code && (
        <div className="p-3 border-t">
          <p className="text-xs text-muted-foreground">
            Code: <span className="font-mono">{subject.code}</span>
          </p>
        </div>
      )}
    </aside>
  )
}
