'use client'

import { useState, useEffect, useCallback } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { TrendingUp, Users, Target, BarChart3 } from 'lucide-react'
import { LIST_PAGE_CLASS } from '@/lib/table-constants'

/* ─── Types ─── */

interface SourceFunnelRow {
  source: string
  total: number
  new: number
  contacted: number
  interested: number
  applied: number
  converted: number
  lost: number
  conversionRate: number
}

interface MonthlyRow {
  month: string
  count: number
}

interface AnalyticsData {
  sourceFunnel: SourceFunnelRow[]
  funnel: Record<string, number>
  monthlyTrend: MonthlyRow[]
  totalLeads: number
}

/* ─── Helpers ─── */

const SOURCE_LABELS: Record<string, string> = {
  WALK_IN: 'Walk-in',
  WEBSITE: 'Website',
  SOCIAL: 'Social',
  REFERRAL: 'Referral',
  OTHER: 'Other',
}

const SOURCE_COLORS: Record<string, string> = {
  WALK_IN: '#3b82f6',
  WEBSITE: '#8b5cf6',
  SOCIAL: '#ec4899',
  REFERRAL: '#f59e0b',
  OTHER: '#6b7280',
}

const FUNNEL_STEPS = [
  { key: 'NEW', label: 'New', color: '#3b82f6' },
  { key: 'CONTACTED', label: 'Contacted', color: '#eab308' },
  { key: 'INTERESTED', label: 'Interested', color: '#8b5cf6' },
  { key: 'APPLIED', label: 'Applied', color: '#6366f1' },
  { key: 'CONVERTED', label: 'Converted', color: '#22c55e' },
  { key: 'LOST', label: 'Lost', color: '#ef4444' },
]

/* ─── Component ─── */

export function LeadAnalytics() {
  const { addParams } = useInstitutionId()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    addParams(params)
    try {
      const res = await fetch(`/api/school/leads/analytics?${params}`)
      if (!res.ok) return
      const json = await res.json() as AnalyticsData
      setData(json)
    } catch { /* */ } finally {
      setLoading(false)
    }
  }, [addParams])

  useEffect(() => { fetchAnalytics() }, [fetchAnalytics])

  if (loading) {
    return (
      <div className={LIST_PAGE_CLASS} style={{ height: 'calc(100vh - 24px)' }}>
        <div className="flex flex-col gap-6 flex-1">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className={LIST_PAGE_CLASS} style={{ height: 'calc(100vh - 24px)' }}>
        <div className="text-center py-12 text-muted-foreground">Failed to load analytics</div>
      </div>
    )
  }

  const maxSourceTotal = Math.max(...data.sourceFunnel.map(s => s.total), 1)
  const maxMonthlyCount = Math.max(...data.monthlyTrend.map(m => m.count), 1)

  return (
    <div className={LIST_PAGE_CLASS} style={{ height: 'calc(100vh - 24px)' }}>
      <div className="flex flex-col gap-6 flex-1 min-h-0 overflow-y-auto">
        <h1 className="text-2xl font-bold tracking-tight shrink-0">Lead Analytics</h1>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 shrink-0">
          <StatCard
            label="Total Leads"
            value={data.totalLeads}
            icon={Users}
            color="text-blue-600 bg-blue-100"
          />
          <StatCard
            label="Applied"
            value={data.funnel.APPLIED ?? 0}
            icon={Target}
            color="text-indigo-600 bg-indigo-100"
          />
          <StatCard
            label="Converted"
            value={data.funnel.CONVERTED ?? 0}
            icon={TrendingUp}
            color="text-green-600 bg-green-100"
          />
          <StatCard
            label="Conversion %"
            value={data.totalLeads > 0
              ? `${Math.round(((data.funnel.CONVERTED ?? 0) / data.totalLeads) * 100)}%`
              : '0%'}
            icon={BarChart3}
            color="text-purple-600 bg-purple-100"
          />
        </div>

        {/* Conversion funnel */}
        <div className="rounded-xl border bg-card p-4 shrink-0">
          <h2 className="text-sm font-semibold mb-4">Conversion Funnel</h2>
          <div className="space-y-3">
            {FUNNEL_STEPS.map(step => {
              const count = data.funnel[step.key] ?? 0
              const pct = data.totalLeads > 0 ? (count / data.totalLeads) * 100 : 0
              return (
                <div key={step.key} className="flex items-center gap-3">
                  <span className="text-xs font-medium w-20 shrink-0 text-muted-foreground">
                    {step.label}
                  </span>
                  <div className="flex-1 h-7 bg-muted rounded-md overflow-hidden relative">
                    <div
                      className="h-full rounded-md transition-all duration-500"
                      style={{ width: `${Math.max(pct, 1)}%`, backgroundColor: step.color }}
                    />
                    <span className="absolute inset-y-0 right-2 flex items-center text-xs font-medium">
                      {count}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Enquiries by source — bar chart using divs */}
        <div className="rounded-xl border bg-card p-4 shrink-0">
          <h2 className="text-sm font-semibold mb-4">Enquiries by Source</h2>
          <div className="space-y-3">
            {data.sourceFunnel.map(row => (
              <div key={row.source} className="flex items-center gap-3">
                <span className="text-xs font-medium w-20 shrink-0 text-muted-foreground">
                  {SOURCE_LABELS[row.source] ?? row.source}
                </span>
                <div className="flex-1 h-7 bg-muted rounded-md overflow-hidden relative">
                  <div
                    className="h-full rounded-md transition-all duration-500"
                    style={{
                      width: `${(row.total / maxSourceTotal) * 100}%`,
                      backgroundColor: SOURCE_COLORS[row.source] ?? '#6b7280',
                    }}
                  />
                  <span className="absolute inset-y-0 right-2 flex items-center text-xs font-medium">
                    {row.total}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly trend */}
        {data.monthlyTrend.length > 0 && (
          <div className="rounded-xl border bg-card p-4 shrink-0">
            <h2 className="text-sm font-semibold mb-4">Monthly Enquiry Trend</h2>
            <div className="flex items-end gap-2 h-40">
              {data.monthlyTrend.map(m => {
                const heightPct = (m.count / maxMonthlyCount) * 100
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-medium">{m.count}</span>
                    <div className="w-full bg-muted rounded-t-md relative" style={{ height: '100%' }}>
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-primary/80 rounded-t-md transition-all duration-500"
                        style={{ height: `${Math.max(heightPct, 3)}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                      {m.month.slice(5)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Source conversion table */}
        <div className="rounded-xl border bg-card overflow-hidden shrink-0">
          <div className="p-4 pb-0">
            <h2 className="text-sm font-semibold mb-3">Conversion by Source</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Source</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Enquiries</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground hidden sm:table-cell">Applied</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Converted</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Conv. %</th>
                </tr>
              </thead>
              <tbody>
                {data.sourceFunnel.map(row => (
                  <tr key={row.source} className="border-b last:border-0">
                    <td className="px-4 py-2.5 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: SOURCE_COLORS[row.source] ?? '#6b7280' }} />
                        {SOURCE_LABELS[row.source] ?? row.source}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">{row.total}</td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground hidden sm:table-cell">{row.applied}</td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">{row.converted}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={`font-medium ${row.conversionRate > 20 ? 'text-green-600' : row.conversionRate > 0 ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                        {row.conversionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
                {data.sourceFunnel.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No data yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Stat Card ─── */

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: number | string
  icon: typeof Users
  color: string
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  )
}
