'use client'

import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Users } from 'lucide-react'
import type { UserBreakdownItem } from './types'

interface Props {
  data: UserBreakdownItem[]
}

const ROLE_CHART_COLORS: Record<string, string> = {
  ADMIN:      '#3b82f6',
  TEACHER:    '#6366f1',
  STUDENT:    '#8b5cf6',
  PARENT:     '#10b981',
  INSTRUCTOR: '#f59e0b',
}

const DEFAULT_COLOR = '#94a3b8'

interface TooltipProps {
  active?: boolean
  payload?: { name: string; value: number }[]
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  if (!item) return null
  return (
    <div className="rounded-lg border bg-background shadow-md
      px-3 py-2 text-xs">
      <p className="font-medium">{item.name}</p>
      <p className="text-muted-foreground mt-0.5">
        {item.value} user{item.value !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

export function UserBreakdownChart({ data }: Props) {
  const total = data.reduce((sum, d) => sum + d.count, 0)

  if (data.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-4">
        <h3 className="font-semibold text-sm mb-4">
          User Breakdown
        </h3>
        <div className="flex flex-col items-center justify-center
          py-10 gap-2">
          <Users className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No users yet
          </p>
        </div>
      </div>
    )
  }

  const chartData = data.map(d => ({
    name: d.role,
    value: d.count,
    color: ROLE_CHART_COLORS[d.role] ?? DEFAULT_COLOR,
  }))

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">User Breakdown</h3>
        <span className="text-xs text-muted-foreground">
          {total} total
        </span>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="space-y-2 mt-2">
        {chartData.map(item => (
          <div key={item.name}
            className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs">{item.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">
                {item.value}
              </span>
              <span className="text-xs text-muted-foreground">
                ({Math.round((item.value / total) * 100)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
