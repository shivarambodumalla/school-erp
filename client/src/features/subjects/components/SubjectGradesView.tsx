'use client'

import { useState, useEffect, useCallback } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import {
  Loader2,
  Settings2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { toast } from 'sonner'

// ─── Types ───

interface WeightageConfig {
  id: string | null
  weights: WeightItem[]
  passingPercentage: number
  roundingMethod: 'NEAREST' | 'FLOOR' | 'CEILING'
  showWeightageToStudents: boolean
}

interface WeightItem {
  type: string
  label: string
  weight: number
}

interface GradebookRow {
  studentId: string
  studentName: string
  rollNo: string | null
  assessmentScores: Record<string, { obtained: number; total: number } | null>
  weightedPercentage: number
  gradeLetter: string | null
}

interface AssessmentColumn {
  id: string
  title: string
  type: string
  totalMarks: number
}

interface GradesData {
  role: 'TEACHER' | 'STUDENT'
  config: WeightageConfig
  columns: AssessmentColumn[]
  rows: GradebookRow[]
  studentRow?: GradebookRow
}

// ─── Props ───

interface Props {
  subjectId: string
}

export function SubjectGradesView({ subjectId }: Props) {
  const { apiParam, addParams } = useInstitutionId()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<GradesData | null>(null)
  const [showConfig, setShowConfig] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      addParams(params)
      const res = await fetch(
        `/api/school/subjects/${subjectId}/gradebook-config?${params}`
      )
      if (res.ok) {
        setData(await res.json())
      }
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [subjectId, addParams])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full
          border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!data) {
    return (
      <p className="text-center text-muted-foreground py-12">
        Failed to load grades.
      </p>
    )
  }

  const isTeacher = data.role === 'TEACHER'

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center
        sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Grades</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isTeacher
              ? `${data.rows.length} students`
              : 'Your grade breakdown'}
          </p>
        </div>
        {isTeacher && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfig(true)}
              className="min-h-[44px]"
            >
              <Settings2 className="h-4 w-4 mr-2" />
              Configure Weightage
            </Button>
          </div>
        )}
      </div>

      {isTeacher ? (
        <TeacherGradebook
          config={data.config}
          columns={data.columns}
          rows={data.rows}
        />
      ) : (
        <StudentGradeCard
          config={data.config}
          columns={data.columns}
          row={data.studentRow ?? null}
        />
      )}

      {isTeacher && (
        <WeightageConfigSheet
          open={showConfig}
          onOpenChange={setShowConfig}
          config={data.config}
          subjectId={subjectId}
          onSaved={() => {
            setShowConfig(false)
            fetchData()
          }}
        />
      )}
    </div>
  )
}

// ─── Teacher Gradebook ───

function TeacherGradebook({
  config,
  columns,
  rows,
}: {
  config: WeightageConfig
  columns: AssessmentColumn[]
  rows: GradebookRow[]
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-16 flex flex-col
        items-center justify-center gap-3 text-center">
        <p className="text-sm text-muted-foreground">
          No student grades available yet.
        </p>
      </div>
    )
  }

  // Group columns by type to show weightage headers
  const typeGroups = config.weights.filter((w) => w.weight > 0)

  return (
    <div className="rounded-xl border bg-card overflow-auto">
      <table className="w-full text-sm">
        <thead>
          {/* Weightage header row */}
          {typeGroups.length > 0 && (
            <tr className="border-b bg-muted/30">
              <th className="sticky left-0 z-10 bg-muted/30 px-4 py-2" />
              {typeGroups.map((w) => {
                const count = columns.filter(
                  (c) => c.type === w.type
                ).length
                return (
                  <th
                    key={w.type}
                    colSpan={Math.max(count, 1)}
                    className="px-3 py-2 text-center text-xs
                      font-medium text-muted-foreground"
                  >
                    {w.label} ({w.weight}%)
                  </th>
                )
              })}
              <th colSpan={2} className="px-3 py-2" />
            </tr>
          )}
          <tr className="border-b bg-muted/50">
            <th className="sticky left-0 z-10 bg-muted/50 w-48
              min-w-[192px] px-4 py-3 text-left font-medium">
              Student
            </th>
            {columns.map((col) => (
              <th
                key={col.id}
                className="px-3 py-3 text-center font-medium
                  min-w-[80px]"
                title={col.title}
              >
                <div className="truncate max-w-[80px]">{col.title}</div>
                <div className="text-xs text-muted-foreground font-normal">
                  /{col.totalMarks}
                </div>
              </th>
            ))}
            <th className="px-3 py-3 text-center font-medium min-w-[80px]">
              Weighted %
            </th>
            <th className="px-3 py-3 text-center font-medium min-w-[60px]">
              Grade
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.studentId} className="border-b last:border-0">
              <td className="sticky left-0 z-10 bg-card px-4 py-2
                whitespace-nowrap">
                <span className="font-medium">{row.studentName}</span>
                {row.rollNo && (
                  <span className="text-xs text-muted-foreground ml-2">
                    #{row.rollNo}
                  </span>
                )}
              </td>
              {columns.map((col) => {
                const cell = row.assessmentScores[col.id]
                return (
                  <td key={col.id} className="px-3 py-2 text-center">
                    {cell
                      ? (
                          <span className={getScoreColor(
                            cell.obtained, cell.total
                          )}>
                            {cell.obtained}
                          </span>
                        )
                      : <span className="text-muted-foreground">{'\u2014'}</span>
                    }
                  </td>
                )
              })}
              <td className="px-3 py-2 text-center font-medium">
                {row.weightedPercentage >= 0
                  ? `${row.weightedPercentage}%`
                  : '\u2014'}
              </td>
              <td className="px-3 py-2 text-center">
                {row.gradeLetter ?? '\u2014'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Student Grade Card ───

function StudentGradeCard({
  config,
  columns,
  row,
}: {
  config: WeightageConfig
  columns: AssessmentColumn[]
  row: GradebookRow | null
}) {
  if (!row) {
    return (
      <div className="rounded-xl border bg-card p-16 flex flex-col
        items-center justify-center gap-3 text-center">
        <p className="text-sm text-muted-foreground">
          Your grades are not available yet.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary card */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Weighted Grade
            </p>
            <p className="text-4xl font-bold mt-1">
              {row.weightedPercentage}%
            </p>
          </div>
          {row.gradeLetter && (
            <div className="h-16 w-16 rounded-full bg-primary/10
              flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {row.gradeLetter}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Weightage breakdown */}
      {config.showWeightageToStudents && config.weights.length > 0 && (
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <h3 className="text-sm font-semibold">Grade Breakdown</h3>
          {config.weights
            .filter((w) => w.weight > 0)
            .map((w) => {
              const typeCols = columns.filter((c) => c.type === w.type)
              const scores = typeCols
                .map((c) => row.assessmentScores[c.id])
                .filter(
                  (s): s is { obtained: number; total: number } => s !== null
                )
              const totalObt = scores.reduce(
                (acc, s) => acc + s.obtained, 0
              )
              const totalMax = scores.reduce(
                (acc, s) => acc + s.total, 0
              )
              const pct = totalMax > 0
                ? Math.round((totalObt / totalMax) * 100)
                : 0
              const weighted = Math.round((pct * w.weight) / 100)

              return (
                <div key={w.type} className="space-y-1">
                  <div className="flex items-center justify-between
                    text-sm">
                    <span>{w.label}</span>
                    <span className="text-muted-foreground">
                      {pct}% &times; {w.weight}% = {weighted}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary
                        transition-all"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
        </div>
      )}

      {/* Per-assessment scores */}
      <div className="rounded-xl border bg-card overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">Assessment</th>
              <th className="text-left px-4 py-3 font-medium
                hidden sm:table-cell">Type</th>
              <th className="text-center px-4 py-3 font-medium">Score</th>
              <th className="text-center px-4 py-3 font-medium">%</th>
            </tr>
          </thead>
          <tbody>
            {columns.map((col) => {
              const cell = row.assessmentScores[col.id]
              const pct = cell
                ? Math.round((cell.obtained / cell.total) * 100)
                : null
              return (
                <tr key={col.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{col.title}</td>
                  <td className="px-4 py-3 text-muted-foreground
                    hidden sm:table-cell">
                    {col.type}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {cell
                      ? `${cell.obtained}/${cell.total}`
                      : '\u2014'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {pct !== null ? (
                      <span className={getScoreColor(
                        cell!.obtained, cell!.total
                      )}>
                        {pct}%
                      </span>
                    ) : (
                      '\u2014'
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Weightage Config Sheet ───

function WeightageConfigSheet({
  open,
  onOpenChange,
  config,
  subjectId,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  config: WeightageConfig
  subjectId: string
  onSaved: () => void
}) {
  const { addParams } = useInstitutionId()
  const [weights, setWeights] = useState<WeightItem[]>(
    config.weights.length > 0
      ? config.weights
      : [
          { type: 'QUIZ', label: 'Quizzes', weight: 20 },
          { type: 'ASSIGNMENT', label: 'Assignments', weight: 40 },
          { type: 'EXAM', label: 'Exams', weight: 30 },
          { type: 'PEER', label: 'Peer Review', weight: 10 },
        ]
  )
  const [passingPct, setPassingPct] = useState(
    config.passingPercentage || 40
  )
  const [rounding, setRounding] = useState<'NEAREST' | 'FLOOR' | 'CEILING'>(
    config.roundingMethod || 'NEAREST'
  )
  const [showToStudents, setShowToStudents] = useState(
    config.showWeightageToStudents ?? true
  )
  const [saving, setSaving] = useState(false)

  const totalWeight = weights.reduce((acc, w) => acc + w.weight, 0)
  const isValid = totalWeight === 100

  const updateWeight = (idx: number, value: number) => {
    setWeights((prev) =>
      prev.map((w, i) => (i === idx ? { ...w, weight: value } : w))
    )
  }

  const handleSave = async () => {
    if (!isValid) return
    setSaving(true)
    try {
      const params = new URLSearchParams()
      addParams(params)
      const res = await fetch(
        `/api/school/subjects/${subjectId}/gradebook-config?${params}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            weights,
            passingPercentage: passingPct,
            roundingMethod: rounding,
            showWeightageToStudents: showToStudents,
          }),
        }
      )
      if (res.ok) {
        toast.success('Weightage configuration saved')
        onSaved()
      } else {
        toast.error('Failed to save configuration')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md
        overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Configure Weightage</SheetTitle>
          <SheetDescription>
            Set how each assessment type contributes to the final grade.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 pt-4">
          {/* Weight inputs */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">
              Assessment Type Weights
            </Label>
            {weights.map((w, idx) => (
              <div
                key={w.type}
                className="flex items-center gap-3"
              >
                <span className="text-sm flex-1 min-w-0 truncate">
                  {w.label}
                </span>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={w.weight}
                    onChange={(e) =>
                      updateWeight(idx, Math.max(0, Number(e.target.value)))
                    }
                    className="w-20 min-h-[44px] text-center"
                    min={0}
                    max={100}
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
            ))}

            {/* Total indicator */}
            <div className="flex items-center justify-between pt-2
              border-t">
              <span className="text-sm font-medium">Total</span>
              <span
                className={`text-sm font-bold
                  ${isValid ? 'text-green-600' : 'text-red-600'}`}
              >
                {totalWeight}%
                {!isValid && (
                  <span className="font-normal text-xs ml-1">
                    (must be 100%)
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Passing percentage */}
          <div className="space-y-2">
            <Label>Passing Percentage</Label>
            <Input
              type="number"
              value={passingPct}
              onChange={(e) =>
                setPassingPct(
                  Math.max(0, Math.min(100, Number(e.target.value)))
                )
              }
              className="min-h-[44px]"
              min={0}
              max={100}
            />
          </div>

          {/* Rounding method */}
          <div className="space-y-2">
            <Label>Rounding Method</Label>
            <Select
              value={rounding}
              onValueChange={(v) =>
                setRounding(v as 'NEAREST' | 'FLOOR' | 'CEILING')
              }
            >
              <SelectTrigger className="min-h-[44px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NEAREST">Nearest</SelectItem>
                <SelectItem value="FLOOR">Floor</SelectItem>
                <SelectItem value="CEILING">Ceiling</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Show to students toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                Show weightage to students
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Students will see how their grade is calculated
              </p>
            </div>
            <Switch
              checked={showToStudents}
              onCheckedChange={setShowToStudents}
            />
          </div>
        </div>

        <SheetFooter className="pt-4">
          <Button
            onClick={handleSave}
            disabled={saving || !isValid}
            className="w-full min-h-[44px]"
          >
            {saving && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Save Configuration
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

// ─── Helpers ───

function getScoreColor(obtained: number, total: number): string {
  if (total <= 0) return ''
  const pct = (obtained / total) * 100
  if (pct >= 80) return 'text-green-600 font-medium'
  if (pct >= 60) return 'text-blue-600'
  if (pct >= 40) return 'text-orange-600'
  return 'text-red-600'
}
