'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Pencil, Trash2, Power, Users, BookOpen, GitBranchPlus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Department } from '../types'
import { getDeptInitials, formatHodSince } from '../types'

interface Props {
  department: Department
  onDelete: (dept: Department) => void
  onToggleStatus: (dept: Department) => void
  onViewOrgChart: (dept: Department) => void
}

export function DepartmentGridCard({ department: dept, onDelete, onToggleStatus, onViewOrgChart }: Props) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const initials = getDeptInitials(dept.name)
  const visibleSubjects = dept.subjectNames.slice(0, 3)
  const extraSubjects = dept.subjectNames.length - 3

  return (
    <div
      className="rounded-xl border bg-card overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-all group"
      onClick={() => router.push(`/management/departments/${dept.id}`)}
    >
      <div className="h-20 relative flex items-center justify-center" style={{ backgroundColor: dept.color }}>
        {dept.avatarUrl ? (
          <img src={dept.avatarUrl} alt={dept.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-2xl font-bold text-white">{initials}</span>
        )}
        <Badge className={`absolute top-2 right-2 text-xs ${dept.status === 'ACTIVE'
          ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
          : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
          {dept.status}
        </Badge>
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg truncate">{dept.name}</h3>
          <div className="relative shrink-0">
            <button type="button" onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
              className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label="More options">
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setMenuOpen(false) }} />
                <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-lg border bg-popover shadow-md py-1">
                  <button type="button" className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors min-h-[44px]"
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); router.push(`/management/departments/${dept.id}/edit`) }}>
                    <Pencil className="h-4 w-4" /> Edit
                  </button>
                  <button type="button" className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors min-h-[44px]"
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onViewOrgChart(dept) }}>
                    <GitBranchPlus className="h-4 w-4" /> View Org Chart
                  </button>
                  <button type="button" className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors min-h-[44px]"
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onToggleStatus(dept) }}>
                    <Power className="h-4 w-4" /> {dept.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </button>
                  {dept._count.staff === 0 && (
                    <button type="button" className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors min-h-[44px]"
                      onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(dept) }}>
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {dept.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{dept.description}</p>
        )}

        <div className="text-sm">
          {dept.hod ? (
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full text-[10px] font-bold flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: dept.color }}>
                {dept.hod.firstName[0]}{dept.hod.lastName[0]}
              </span>
              <span className="font-medium truncate">{dept.hod.firstName} {dept.hod.lastName}</span>
              {dept.hodSince && <span className="text-xs text-muted-foreground">since {formatHodSince(dept.hodSince)}</span>}
            </div>
          ) : (
            <Badge className="bg-amber-100 text-amber-700 border-amber-200">No HOD assigned</Badge>
          )}
        </div>

        {dept.deputyHod && (
          <p className="text-xs text-muted-foreground truncate">
            Deputy: {dept.deputyHod.firstName} {dept.deputyHod.lastName}
          </p>
        )}

        <div className="flex items-center gap-2 mt-auto">
          <Badge variant="secondary" className="gap-1"><Users className="h-3 w-3" />{dept._count.staff}</Badge>
          <Badge variant="secondary" className="gap-1"><BookOpen className="h-3 w-3" />{dept.subjectNames.length}</Badge>
        </div>

        {dept.subjectNames.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {visibleSubjects.map((sub) => (
              <span key={sub} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${dept.color}20`, color: dept.color }}>
                {sub}
              </span>
            ))}
            {extraSubjects > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">+{extraSubjects} more</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
