'use client'

import { Activity, CreditCard, BookOpen, ShieldAlert } from 'lucide-react'

interface Props {
  attendance: { pct: number }
  fees: { pendingAmount: number }
  coursesCount: number
  riskLevel: string
  riskScore: number
}

const RISK_COLORS: Record<string, string> = {
  GREEN: 'bg-green-100 text-green-700',
  AMBER: 'bg-amber-100 text-amber-700',
  RED: 'bg-red-100 text-red-700',
  CRITICAL: 'bg-red-100 text-red-700 animate-pulse',
}

function attColor(pct: number) {
  if (pct >= 90) return 'text-green-600'
  if (pct >= 75) return 'text-amber-600'
  return 'text-red-600'
}

export function StudentOverviewStats({
  attendance, fees, coursesCount, riskLevel, riskScore,
}: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Attendance */}
      <div className="rounded-xl border bg-card p-4 space-y-1">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Activity className="h-4 w-4" />
          <span className="text-xs font-medium">Attendance</span>
        </div>
        <p className={`text-2xl font-bold ${attColor(attendance.pct)}`}>
          {attendance.pct}%
        </p>
        <p className="text-xs text-muted-foreground">This month</p>
      </div>

      {/* Fees */}
      <div className="rounded-xl border bg-card p-4 space-y-1">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CreditCard className="h-4 w-4" />
          <span className="text-xs font-medium">Fees Pending</span>
        </div>
        <p className={`text-2xl font-bold ${
          fees.pendingAmount > 0 ? 'text-red-600' : 'text-green-600'
        }`}>
          {fees.pendingAmount > 0
            ? `₹${fees.pendingAmount.toLocaleString('en-IN')}`
            : '₹0'}
        </p>
        <p className="text-xs text-muted-foreground">Outstanding</p>
      </div>

      {/* Courses */}
      <div className="rounded-xl border bg-card p-4 space-y-1">
        <div className="flex items-center gap-2 text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          <span className="text-xs font-medium">Courses</span>
        </div>
        <p className="text-2xl font-bold">{coursesCount}</p>
        <p className="text-xs text-muted-foreground">Enrolled</p>
      </div>

      {/* Risk */}
      <div className="rounded-xl border bg-card p-4 space-y-1">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ShieldAlert className="h-4 w-4" />
          <span className="text-xs font-medium">Risk Score</span>
        </div>
        <span className={`inline-block text-sm font-bold px-2 py-0.5
          rounded ${RISK_COLORS[riskLevel] ?? 'bg-muted'}`}>
          {riskLevel}
        </span>
        <p className="text-xs text-muted-foreground">{riskScore}/100</p>
      </div>
    </div>
  )
}
