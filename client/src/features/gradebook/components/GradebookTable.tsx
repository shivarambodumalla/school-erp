'use client'

import { GradeCell } from './GradeCell'
import type { GradebookData } from '../types'

interface Props {
  data: GradebookData
  subjectId: string
  onRefresh: () => void
}

export function GradebookTable({ data, subjectId, onRefresh }: Props) {
  const { examTypes, students } = data

  const classAverages = examTypes.map((et) => {
    let sum = 0
    let count = 0
    for (const s of students) {
      const g = s.grades[et.id]
      if (g) {
        sum += (g.marksObtained / g.totalMarks) * 100
        count++
      }
    }
    return count > 0 ? Math.round(sum / count) : null
  })

  return (
    <div className="rounded-xl border bg-card overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="sticky left-0 z-10 bg-muted/50
              w-48 min-w-[192px] px-4 py-3 text-left font-medium">
              Student
            </th>
            {examTypes.map((et) => (
              <th
                key={et.id}
                className="px-3 py-3 text-center font-medium
                  min-w-[80px]"
              >
                {et.shortName}
              </th>
            ))}
            <th className="px-3 py-3 text-center font-medium">
              Total %
            </th>
            <th className="px-3 py-3 text-center font-medium">
              Grade
            </th>
            <th className="px-3 py-3 text-center font-medium">
              Rank
            </th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.studentId} className="border-b last:border-0">
              <td className="sticky left-0 z-10 bg-card px-4 py-2
                whitespace-nowrap">
                <span className="font-medium">
                  {s.firstName} {s.lastName}
                </span>
                {s.rollNo && (
                  <span className="text-xs text-muted-foreground ml-2">
                    #{s.rollNo}
                  </span>
                )}
              </td>
              {examTypes.map((et) => (
                <td key={et.id} className="px-1 py-1 text-center">
                  <GradeCell
                    cell={s.grades[et.id]}
                    studentId={s.studentId}
                    examTypeId={et.id}
                    subjectId={subjectId}
                    onSaved={onRefresh}
                  />
                </td>
              ))}
              <td className="px-3 py-2 text-center font-medium">
                {s.totalMax > 0 ? `${s.percentage}%` : '\u2014'}
              </td>
              <td className="px-3 py-2 text-center">
                {s.overallGrade ?? '\u2014'}
              </td>
              <td className="px-3 py-2 text-center">
                {s.rank > 0 ? s.rank : '\u2014'}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t bg-muted/30">
            <td className="sticky left-0 z-10 bg-muted/30 px-4
              py-2 font-medium">
              Class Average
            </td>
            {classAverages.map((avg, i) => (
              <td key={examTypes[i].id} className="px-3 py-2
                text-center text-muted-foreground">
                {avg !== null ? `${avg}%` : '\u2014'}
              </td>
            ))}
            <td colSpan={3} />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
