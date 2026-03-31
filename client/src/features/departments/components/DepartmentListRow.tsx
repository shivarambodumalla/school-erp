'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Pencil, Trash2, Power, Users, GitBranchPlus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Department } from '../types'

interface Props {
  department: Department
  onDelete: (dept: Department) => void
  onToggleStatus: (dept: Department) => void
  onViewOrgChart: (dept: Department) => void
}

export function DepartmentListRow({ department: dept, onDelete, onToggleStatus, onViewOrgChart }: Props) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div
      className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50 transition-colors group"
      onClick={() => router.push(`/management/departments/${dept.id}`)}
    >
      <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: dept.color }} />

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{dept.name}</p>
        {dept.description && (
          <p className="text-sm text-muted-foreground truncate">{dept.description}</p>
        )}
      </div>

      <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground shrink-0">
        {dept.hod && (
          <span className="truncate max-w-[150px]">{dept.hod.firstName} {dept.hod.lastName}</span>
        )}
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" /> {dept._count.staff}
        </span>
      </div>

      <Badge className={`shrink-0 text-xs ${dept.status === 'ACTIVE'
        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
        : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
        {dept.status}
      </Badge>

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
  )
}
