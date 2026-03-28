'use client'

import { useEffect, useState } from 'react'

interface EnrollmentRow {
  id: string
  studentId: string
  studentName: string
  admissionNo: string
  enrolledAt: string
  progressPercent: number
  completedAt: string | null
}

interface Props {
  courseId: string
}

export function CourseStudentsTab({ courseId }: Props) {
  const [rows, setRows] = useState<EnrollmentRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/school/courses/${courseId}/enrollments`)
      .then((r) => r.json())
      .then((d: { enrollments: EnrollmentRow[] }) => setRows(d.enrollments))
      .finally(() => setLoading(false))
  }, [courseId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 mt-4">
        <div className="h-6 w-6 animate-spin rounded-full
          border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8 mt-4">
        No students enrolled yet.
      </p>
    )
  }

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-muted-foreground text-left">
            <th className="pb-2 font-medium">Student</th>
            <th className="pb-2 font-medium">Adm No</th>
            <th className="pb-2 font-medium">Progress</th>
            <th className="pb-2 font-medium">Enrolled</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b">
              <td className="py-2">{r.studentName}</td>
              <td className="py-2">{r.admissionNo}</td>
              <td className="py-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-20 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${r.progressPercent}%` }}
                    />
                  </div>
                  <span className="text-xs">{r.progressPercent}%</span>
                </div>
              </td>
              <td className="py-2 text-muted-foreground text-xs">
                {new Date(r.enrolledAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
