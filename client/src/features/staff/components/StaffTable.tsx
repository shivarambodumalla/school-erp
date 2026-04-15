'use client'

import { Badge } from '@/components/ui/badge'
import { generateColor, getInitials, STAFF_STATUS_COLORS } from '@/lib/colors'
import type { StaffListItem } from '../types'

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
                  <div className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center
                    text-gray-800 text-xs font-bold" style={{ backgroundColor: generateColor(s.firstName) }}>
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
                  className={STAFF_STATUS_COLORS[s.status] ?? ''}>
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
            <div className="h-10 w-10 rounded-full shrink-0 flex items-center justify-center
              text-gray-800 text-sm font-bold" style={{ backgroundColor: generateColor(s.firstName) }}>
              {getInitials(s.firstName, s.lastName)}
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">{s.firstName} {s.lastName}</p>
              <p className="text-sm text-muted-foreground truncate">{s.designation}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{s.department?.name ?? '-'}</span>
            <Badge variant="secondary" className={STAFF_STATUS_COLORS[s.status] ?? ''}>
              {s.status}
            </Badge>
          </div>
        </button>
      ))}
    </div>
  )
}
