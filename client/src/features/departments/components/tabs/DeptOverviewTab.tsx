'use client'

import { Users, BookOpen, Megaphone, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatHodSince } from '../../types'

interface Props {
  department: {
    color: string; status: 'ACTIVE' | 'INACTIVE'
    createdAt: string; hodSince: string | null
    subjectNames: string[]
    _count: { staff: number; announcements: number }
  }
}

export function DeptOverviewTab({ department: dept }: Props) {
  const stats = [
    { icon: Users, label: 'Total Staff', value: dept._count.staff },
    { icon: BookOpen, label: 'Subjects', value: dept.subjectNames.length },
    { icon: Megaphone, label: 'Announcements', value: dept._count.announcements },
    { icon: Calendar, label: 'HOD Since', value: dept.hodSince ? formatHodSince(dept.hodSince) : 'N/A' },
  ]

  return (
    <div className="space-y-6 pt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <s.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h3 className="font-semibold mb-4">Quick Info</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md" style={{ backgroundColor: dept.color }} />
            <div>
              <p className="text-xs text-muted-foreground">Department Color</p>
              <p className="text-sm font-medium">{dept.color}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Created</p>
            <p className="text-sm font-medium">
              {new Date(dept.createdAt).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric',
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <Badge className={`mt-1 ${dept.status === 'ACTIVE'
              ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
              : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
              {dept.status}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
