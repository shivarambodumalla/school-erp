'use client'

import { Badge } from '@/components/ui/badge'
import type { StaffListItem } from '../types'

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-emerald-500',
  'bg-amber-500', 'bg-rose-500', 'bg-indigo-500',
]

function getColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] ?? 'bg-gray-500'
}

function getInitials(f: string, l: string) {
  return `${f[0] ?? ''}${l[0] ?? ''}`.toUpperCase()
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-600',
  ON_LEAVE: 'bg-yellow-100 text-yellow-700',
  TERMINATED: 'bg-red-100 text-red-700',
}

export function StaffTable({ staff, onRowClick }: {
  staff: StaffListItem[]; onRowClick: (id: string) => void
}) {
  return (
    <div className="rounded-xl border overflow-hidden overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr className="border-b">
            <th className="text-left px-4 py-3 font-medium">Employee</th>
            <th className="text-left px-4 py-3 font-medium">No</th>
            <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Designation</th>
            <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Dept</th>
            <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Role</th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {staff.map(s => (
            <tr key={s.id} onClick={() => onRowClick(s.id)}
              className="border-b last:border-0 cursor-pointer hover:bg-muted/50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center
                    text-white text-xs font-bold ${getColor(s.firstName)}`}>
                    {getInitials(s.firstName, s.lastName)}
                  </div>
                  <span className="font-medium">{s.firstName} {s.lastName}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{s.employeeNo}</td>
              <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{s.designation}</td>
              <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                {s.department?.name ?? '-'}
              </td>
              <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                {s.primaryRole?.name ?? '-'}
              </td>
              <td className="px-4 py-3">
                <Badge variant="secondary"
                  className={STATUS_COLORS[s.status] ?? ''}>
                  {s.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function StaffCards({ staff, onCardClick }: {
  staff: StaffListItem[]; onCardClick: (id: string) => void
}) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {staff.map(s => (
        <button key={s.id} type="button" onClick={() => onCardClick(s.id)}
          className="rounded-xl border p-4 text-left hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full shrink-0 flex items-center justify-center
              text-white text-sm font-bold ${getColor(s.firstName)}`}>
              {getInitials(s.firstName, s.lastName)}
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">{s.firstName} {s.lastName}</p>
              <p className="text-sm text-muted-foreground truncate">{s.designation}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{s.department?.name ?? '-'}</span>
            <Badge variant="secondary" className={STATUS_COLORS[s.status] ?? ''}>
              {s.status}
            </Badge>
          </div>
        </button>
      ))}
    </div>
  )
}
