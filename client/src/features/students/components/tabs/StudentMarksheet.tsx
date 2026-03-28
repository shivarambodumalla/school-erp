'use client'

import { useState } from 'react'

interface GradeRow {
  subjectName: string
  maxMarks: number
  obtained: number
  percentage: number
  grade: string
}

interface ExamGroup {
  examType: string
  grades: GradeRow[]
  totalObtained: number
  totalMax: number
  avgPct: number
  overallGrade: string
}

interface Props {
  gradesByExam: ExamGroup[]
}

const GRADE_COLORS: Record<string, string> = {
  'A+': 'bg-green-100 text-green-700', A: 'bg-blue-100 text-blue-700',
  'B+': 'bg-indigo-100 text-indigo-700', B: 'bg-amber-100 text-amber-700',
  C: 'bg-orange-100 text-orange-700', F: 'bg-red-100 text-red-700',
}

export function StudentMarksheet({ gradesByExam }: Props) {
  const [activeExam, setActiveExam] = useState(gradesByExam[0]?.examType ?? '')

  if (gradesByExam.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-semibold mb-4">Marksheet</h3>
        <p className="text-sm text-muted-foreground text-center py-8">
          No exam results for this year
        </p>
      </div>
    )
  }

  const exam = gradesByExam.find(e => e.examType === activeExam) ?? gradesByExam[0]

  return (
    <div className="rounded-xl border bg-card">
      <div className="p-4 border-b">
        <h3 className="text-sm font-semibold">Marksheet</h3>
      </div>

      {/* Exam type tabs */}
      <div className="flex gap-1 px-4 pt-3 overflow-x-auto scrollbar-none">
        {gradesByExam.map(e => (
          <button key={e.examType} onClick={() => setActiveExam(e.examType)}
            className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-full
              transition-colors min-h-[36px]
              ${activeExam === e.examType
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
            {e.examType}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-xs text-muted-foreground">
              <th className="text-left px-4 py-2">Subject</th>
              <th className="text-right px-4 py-2">Max</th>
              <th className="text-right px-4 py-2">Obtained</th>
              <th className="text-right px-4 py-2">%</th>
              <th className="text-center px-4 py-2">Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {exam.grades.map((g, i) => (
              <tr key={i}>
                <td className="px-4 py-2.5 font-medium">{g.subjectName}</td>
                <td className="px-4 py-2.5 text-right text-muted-foreground">{g.maxMarks}</td>
                <td className="px-4 py-2.5 text-right">{g.obtained}</td>
                <td className="px-4 py-2.5 text-right">{g.percentage}%</td>
                <td className="px-4 py-2.5 text-center">
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded
                    ${GRADE_COLORS[g.grade] ?? 'bg-muted'}`}>
                    {g.grade}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t font-semibold text-xs">
              <td className="px-4 py-2.5">Total</td>
              <td className="px-4 py-2.5 text-right">{exam.totalMax}</td>
              <td className="px-4 py-2.5 text-right">{exam.totalObtained}</td>
              <td className="px-4 py-2.5 text-right">{exam.avgPct}%</td>
              <td className="px-4 py-2.5 text-center">
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded
                  ${GRADE_COLORS[exam.overallGrade] ?? 'bg-muted'}`}>
                  {exam.overallGrade}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
