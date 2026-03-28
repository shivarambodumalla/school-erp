'use client'

import { Button } from '@/components/ui/button'
import type { StatusFilter } from './leave-types'

interface Props {
  status: StatusFilter
  onStatusChange: (s: StatusFilter) => void
}

const STATUSES: StatusFilter[] = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']

const PILL_COLORS: Record<StatusFilter, string> = {
  ALL: 'bg-primary text-primary-foreground',
  PENDING: 'bg-amber-600 text-white',
  APPROVED: 'bg-green-600 text-white',
  REJECTED: 'bg-red-600 text-white',
  CANCELLED: 'bg-gray-500 text-white',
}

export function LeaveFilters({ status, onStatusChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {STATUSES.map(s => (
        <Button
          key={s}
          size="sm"
          variant={status === s ? 'default' : 'outline'}
          className={`min-h-[44px] ${status === s ? PILL_COLORS[s] : ''}`}
          onClick={() => onStatusChange(s)}
        >
          {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
        </Button>
      ))}
    </div>
  )
}
