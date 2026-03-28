'use client'

import { useEffect, useState } from 'react'
import { GraduationCap, TrendingUp } from 'lucide-react'

interface ExamScore {
  examName: string
  obtained: number
  total: number
}

interface SubjectGrade {
  subjectName: string
  exams: ExamScore[]
}

interface GradesData {
  overallPercent: number
  subjects: SubjectGrade[]
}

export function StudentGradesClient() {
  const [data, setData] = useState<GradesData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/student/grades')
      .then((r) => r.json())
      .then((d: GradesData) => setData(d))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full
          border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!data) {
    return <p className="text-muted-foreground p-4">No data.</p>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">My Grades</h1>

      {/* Summary cards */}
      <div className="grid gap-4 grid-cols-2">
        <div className="rounded-xl border bg-card p-4 text-center">
          <TrendingUp className="h-6 w-6 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold">{data.overallPercent}%</p>
          <p className="text-xs text-muted-foreground">Overall</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <GraduationCap className="h-6 w-6 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold">
            {data.overallPercent >= 90 ? 'A+' :
             data.overallPercent >= 80 ? 'A' :
             data.overallPercent >= 70 ? 'B' :
             data.overallPercent >= 60 ? 'C' : 'D'}
          </p>
          <p className="text-xs text-muted-foreground">Grade</p>
        </div>
      </div>

      {/* Per-subject */}
      {data.subjects.length === 0 && (
        <p className="text-muted-foreground text-center py-8">
          No grades recorded yet.
        </p>
      )}

      {data.subjects.map((sub) => {
        const total = sub.exams.reduce((a, e) => a + e.total, 0)
        const obt = sub.exams.reduce((a, e) => a + e.obtained, 0)
        const pct = total > 0 ? Math.round((obt / total) * 100) : 0
        return (
          <div key={sub.subjectName} className="rounded-xl border bg-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{sub.subjectName}</p>
              <span className="text-sm font-medium text-primary">{pct}%</span>
            </div>
            <div className="flex gap-3 flex-wrap">
              {sub.exams.map((ex) => (
                <div key={ex.examName} className="text-center">
                  <p className="text-xs text-muted-foreground">{ex.examName}</p>
                  <p className="text-sm font-medium">
                    {ex.obtained}/{ex.total}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
