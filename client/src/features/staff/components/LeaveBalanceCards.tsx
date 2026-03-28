'use client'

import { Card } from '@/components/ui/card'
import type { LeaveBalance } from './leave-types'

interface Props {
  balances: LeaveBalance[]
}

function getBarColor(used: number, total: number): string {
  const pct = total > 0 ? (used / total) * 100 : 0
  if (pct >= 90) return 'bg-red-500'
  if (pct >= 70) return 'bg-amber-500'
  return 'bg-green-500'
}

export function LeaveBalanceCards({ balances }: Props) {
  if (balances.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No leave types configured for this institution.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {balances.map(b => {
        const pct = b.total > 0 ? Math.min((b.used / b.total) * 100, 100) : 0
        const colorClass = getBarColor(b.used, b.total)

        return (
          <Card key={b.leaveTypeId} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{b.name}</p>
                <p className="text-xs text-muted-foreground">{b.shortName}</p>
              </div>
              <p className="text-lg font-bold">
                {b.remaining}
                <span className="text-xs text-muted-foreground">/{b.total}</span>
              </p>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${colorClass}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Used: {b.used}</span>
              {b.carryForward && <span>Carry forward</span>}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
