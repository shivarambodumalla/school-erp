'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import type { LoginActivityPoint } from './types'

interface Props {
  data: LoginActivityPoint[]
  primaryColor: string
}

interface TooltipProps {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-background shadow-md
      px-3 py-2 text-xs">
      <p className="font-medium">{label}</p>
      <p className="text-muted-foreground mt-0.5">
        {payload[0]?.value ?? 0} login
        {(payload[0]?.value ?? 0) !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

export function LoginActivityChart({ data, primaryColor }: Props) {
  const totalLogins = data.reduce((sum, d) => sum + d.logins, 0)
  const hasActivity = totalLogins > 0

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-sm">Login Activity</h3>
        <span className="text-xs text-muted-foreground">
          Last 7 days
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        {hasActivity
          ? `${totalLogins} login${totalLogins !== 1 ? 's' : ''} this week`
          : 'No logins in the last 7 days'}
      </p>

      {!hasActivity ? (
        <div className="flex flex-col items-center justify-center
          py-8 gap-2">
          <TrendingUp className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No login activity
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart
            data={data}
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id="loginGradient"
                x1="0" y1="0" x2="0" y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={primaryColor}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={primaryColor}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="logins"
              stroke={primaryColor}
              strokeWidth={2}
              fill="url(#loginGradient)"
              dot={{ fill: primaryColor, r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
