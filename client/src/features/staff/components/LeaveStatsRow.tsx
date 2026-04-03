'use client'

import { Card } from '@/components/ui/card'
import { Clock, CheckCircle2, UserMinus, FileText } from 'lucide-react'
import type { LeaveRecord } from './leave-types'

interface Props {
  leaves: LeaveRecord[]
}

export function LeaveStatsRow({ leaves }: Props) {
  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()
  const todayStr = now.toISOString().slice(0, 10)

  const pending = leaves.filter(l => l.status === 'PENDING').length

  const approvedThisMonth = leaves.filter(l => {
    if (l.status !== 'APPROVED') return false
    const d = new Date(l.reviewedAt ?? l.appliedAt)
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear
  }).length

  const onLeaveToday = leaves.filter(l => {
    if (l.status !== 'APPROVED') return false
    return l.fromDate.slice(0, 10) <= todayStr && l.toDate.slice(0, 10) >= todayStr
  }).length

  const stats = [
    { label: 'Pending Approval', value: pending, icon: Clock, color: 'text-amber-600' },
    { label: 'Approved This Month', value: approvedThisMonth, icon: CheckCircle2, color: 'text-green-600' },
    { label: 'On Leave Today', value: onLeaveToday, icon: UserMinus, color: 'text-blue-600' },
    { label: 'Total Applied', value: leaves.length, icon: FileText, color: 'text-violet-600' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
      {stats.map(s => (
        <Card key={s.label} className="p-4">
          <div className="flex items-center gap-3">
            <div className={`${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
