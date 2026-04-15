'use client'

import { Button } from '@/components/ui/button'
import { LEAVE_PILL_COLORS } from '@/lib/colors'
import type { StatusFilter } from './leave-types'

interface Props {
  status: StatusFilter
  onStatusChange: (s: StatusFilter) => void
}

const STATUSES: StatusFilter[] = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']

export function LeaveFilters({ status, onStatusChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {STATUSES.map(s => (
        <Button
          key={s}
          size="sm"
          variant={status === s ? 'default' : 'outline'}
          className={`min-h-[44px] ${status === s ? LEAVE_PILL_COLORS[s] : ''}`}
          onClick={() => onStatusChange(s)}
        >
          {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
        </Button>
      ))}
    </div>
  )
}
