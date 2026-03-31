'use client'

import { useState, useEffect, useCallback } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import {
  Loader2,
  TrendingUp,
  Users,
  AlertTriangle,
  BarChart3,
  ArrowDown,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// ─── Types ───

interface OverviewStats {
  completionRate: number
  avgScore: number
  activeStudents: number
  atRiskStudents: number
}

interface ModuleCompletion {
  moduleId: string
  moduleName: string
  completionPercent: number
}

interface ItemEngagement {
  itemId: string
  itemTitle: string
  moduleName: string
  views: number
  completions: number
  avgTimeMinutes: number
  avgScore: number | null
}

interface StudentProgress {
  studentId: string
  studentName: string
  itemsDone: number
  totalItems: number
  lastActive: string | null
  avgScore: number | null
  isAtRisk: boolean
}

interface StrugglingAlert {
  type: 'inactive' | 'missing_submission'
  message: string
  severity: 'warning' | 'danger'
}

// ─── Props ───

interface Props {
  subjectId: string
}

export function AnalyticsView({ subjectId }: Props) {
  const { addParams } = useInstitutionId()
  const [overview, setOverview] = useState<OverviewStats | null>(
    null
  )
  const [moduleCompletions, setModuleCompletions] = useState<
    ModuleCompletion[]
  >([])
  const [items, setItems] = useState<ItemEngagement[]>([])
  const [students, setStudents] = useState<StudentProgress[]>([])
  const [alerts, setAlerts] = useState<StrugglingAlert[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      addParams(params)
      const paramStr = params.toString()

      const [overviewRes, itemsRes, studentsRes] =
        await Promise.all([
          fetch(
            `/api/school/subjects/${subjectId}/analytics/overview?${paramStr}`
          ),
          fetch(
            `/api/school/subjects/${subjectId}/analytics/items?${paramStr}`
          ),
          fetch(
            `/api/school/subjects/${subjectId}/analytics/students?${paramStr}`
          ),
        ])

      if (overviewRes.ok) {
        const data = (await overviewRes.json()) as {
          stats: OverviewStats
          moduleCompletions: ModuleCompletion[]
          alerts: StrugglingAlert[]
        }
        setOverview(data.stats)
        setModuleCompletions(data.moduleCompletions)
        setAlerts(data.alerts)
      }

      if (itemsRes.ok) {
        const data = (await itemsRes.json()) as {
          items: ItemEngagement[]
        }
        setItems(data.items)
      }

      if (studentsRes.ok) {
        const data = (await studentsRes.json()) as {
          students: StudentProgress[]
        }
        setStudents(data.students)
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [subjectId, addParams])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin
          text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Student progress and engagement insights
        </p>
      </div>

      {/* Overview stat cards */}
      {overview && <OverviewCards stats={overview} />}

      {/* Completion chart */}
      {moduleCompletions.length > 0 && (
        <CompletionChart completions={moduleCompletions} />
      )}

      {/* Struggling Alerts */}
      {alerts.length > 0 && (
        <StrugglingAlerts alerts={alerts} />
      )}

      {/* Item Engagement Table */}
      {items.length > 0 && (
        <ItemEngagementTable items={items} />
      )}

      {/* Student Progress Table */}
      {students.length > 0 && (
        <StudentProgressTable students={students} />
      )}

      {/* Empty state if no data */}
      {!overview &&
        items.length === 0 &&
        students.length === 0 && (
          <div className="rounded-xl border bg-card p-16
            flex flex-col items-center text-center gap-4">
            <div className="h-12 w-12 rounded-full bg-muted
              flex items-center justify-center">
              <BarChart3 className="h-6 w-6
                text-muted-foreground" />
            </div>
            <p className="font-semibold">
              No analytics data yet
            </p>
            <p className="text-sm text-muted-foreground
              max-w-sm">
              Analytics will appear once students start
              engaging with course content.
            </p>
          </div>
        )}
    </div>
  )
}

// ─── Overview Cards ───

function OverviewCards({ stats }: { stats: OverviewStats }) {
  const cards = [
    {
      label: 'Completion Rate',
      value: `${Math.round(stats.completionRate)}%`,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Avg Score',
      value: `${Math.round(stats.avgScore)}%`,
      icon: BarChart3,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Active Students',
      value: String(stats.activeStudents),
      icon: Users,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
    {
      label: 'At Risk',
      value: String(stats.atRiskStudents),
      icon: AlertTriangle,
      color:
        stats.atRiskStudents > 0
          ? 'text-red-600'
          : 'text-green-600',
      bg:
        stats.atRiskStudents > 0
          ? 'bg-red-50'
          : 'bg-green-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className="rounded-xl border bg-card p-4
              space-y-2"
          >
            <div className="flex items-center gap-2">
              <div
                className={`h-8 w-8 rounded-lg flex
                  items-center justify-center ${card.bg}`}
              >
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
              <span className="text-sm text-muted-foreground">
                {card.label}
              </span>
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        )
      })}
    </div>
  )
}

// ─── Completion Chart (bar chart using divs) ───

function CompletionChart({
  completions,
}: {
  completions: ModuleCompletion[]
}) {
  return (
    <div className="rounded-xl border bg-card p-4 sm:p-6
      space-y-4">
      <h2 className="text-lg font-semibold">
        Module Completion
      </h2>
      <div className="space-y-3">
        {completions.map((mc) => {
          const pct = Math.round(mc.completionPercent)
          const barColor =
            pct >= 80
              ? 'bg-green-500'
              : pct >= 60
                ? 'bg-amber-500'
                : 'bg-red-500'
          const textColor =
            pct >= 80
              ? 'text-green-700'
              : pct >= 60
                ? 'text-amber-700'
                : 'text-red-700'

          return (
            <div key={mc.moduleId} className="space-y-1.5">
              <div className="flex items-center
                justify-between">
                <span className="text-sm font-medium
                  truncate mr-3">
                  {mc.moduleName}
                </span>
                <span
                  className={`text-sm font-semibold
                    shrink-0 ${textColor}`}
                >
                  {pct}%
                </span>
              </div>
              <div className="h-2.5 bg-muted rounded-full
                overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all
                    duration-500 ${barColor}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Struggling Alerts ───

function StrugglingAlerts({
  alerts,
}: {
  alerts: StrugglingAlert[]
}) {
  return (
    <div className="rounded-xl border bg-card p-4 sm:p-6
      space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        <h2 className="text-lg font-semibold">
          Attention Needed
        </h2>
      </div>
      <div className="space-y-2">
        {alerts.map((alert, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 rounded-lg
              p-3 text-sm ${
                alert.severity === 'danger'
                  ? 'bg-red-50 text-red-800'
                  : 'bg-amber-50 text-amber-800'
              }`}
          >
            <AlertTriangle
              className={`h-4 w-4 shrink-0 mt-0.5 ${
                alert.severity === 'danger'
                  ? 'text-red-600'
                  : 'text-amber-600'
              }`}
            />
            <span>{alert.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Item Engagement Table ───

function ItemEngagementTable({
  items,
}: {
  items: ItemEngagement[]
}) {
  // Sort by completion ascending (lowest first)
  const sorted = [...items].sort(
    (a, b) => a.completions - b.completions
  )

  // Low completion threshold: items with < 50% completion
  // relative to max completions
  const maxCompletions = Math.max(
    ...items.map((i) => i.completions),
    1
  )
  const lowThreshold = maxCompletions * 0.3

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b">
        <h2 className="text-lg font-semibold">
          Item Engagement
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Sorted by completion (lowest first)
        </p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="hidden sm:table-cell">
                Module
              </TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">
                Completions
              </TableHead>
              <TableHead className="hidden md:table-cell
                text-right">
                Avg Time
              </TableHead>
              <TableHead className="hidden md:table-cell
                text-right">
                Avg Score
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((item) => {
              const isLow = item.completions < lowThreshold
              return (
                <TableRow
                  key={item.itemId}
                  className={
                    isLow ? 'bg-red-50/50' : undefined
                  }
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {isLow && (
                        <ArrowDown className="h-3.5 w-3.5
                          text-red-500 shrink-0" />
                      )}
                      <span className="font-medium text-sm
                        truncate max-w-[200px]">
                        {item.itemTitle}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell
                    text-sm text-muted-foreground">
                    {item.moduleName}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {item.views}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {item.completions}
                  </TableCell>
                  <TableCell className="hidden md:table-cell
                    text-right text-sm">
                    {item.avgTimeMinutes > 0
                      ? `${Math.round(item.avgTimeMinutes)}m`
                      : '--'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell
                    text-right text-sm">
                    {item.avgScore !== null
                      ? `${Math.round(item.avgScore)}%`
                      : '--'}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// ─── Student Progress Table ───

function StudentProgressTable({
  students,
}: {
  students: StudentProgress[]
}) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b">
        <h2 className="text-lg font-semibold">
          Student Progress
        </h2>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead className="text-right">
                Items Done
              </TableHead>
              <TableHead className="hidden sm:table-cell
                text-right">
                Last Active
              </TableHead>
              <TableHead className="hidden md:table-cell
                text-right">
                Avg Score
              </TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((s) => (
              <TableRow
                key={s.studentId}
                className={
                  s.isAtRisk ? 'bg-red-50/50' : undefined
                }
              >
                <TableCell>
                  <span className="font-medium text-sm">
                    {s.studentName}
                  </span>
                </TableCell>
                <TableCell className="text-right text-sm">
                  {s.itemsDone}/{s.totalItems}
                </TableCell>
                <TableCell className="hidden sm:table-cell
                  text-right text-sm text-muted-foreground">
                  {s.lastActive
                    ? formatRelativeDate(s.lastActive)
                    : 'Never'}
                </TableCell>
                <TableCell className="hidden md:table-cell
                  text-right text-sm">
                  {s.avgScore !== null
                    ? `${Math.round(s.avgScore)}%`
                    : '--'}
                </TableCell>
                <TableCell className="text-right">
                  {s.isAtRisk ? (
                    <Badge
                      variant="destructive"
                      className="text-xs"
                    >
                      At Risk
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="text-xs"
                    >
                      On Track
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// ─── Helpers ───

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}
