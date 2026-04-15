'use client'

import { BookOpen } from 'lucide-react'
import { COURSE_PROGRESS_COLORS } from '@/lib/colors'

interface Course {
  title: string
  subject?: string
  progressPercent: number
  completedAt: string | null
}

interface Props {
  courses: Course[]
}

function courseStatus(c: Course) {
  if (c.completedAt) return 'COMPLETED'
  if (c.progressPercent > 0) return 'IN_PROGRESS'
  return 'NOT_STARTED'
}

export function StudentAcademicsCourses({ courses }: Props) {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <h3 className="text-sm font-semibold">Courses this year</h3>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
          <BookOpen className="h-8 w-8" />
          <p className="text-sm">No courses enrolled</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {courses.map((c, i) => {
            const status = courseStatus(c)
            return (
              <div key={i} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium truncate">{c.title}</p>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5
                    rounded shrink-0 ${COURSE_PROGRESS_COLORS[status]}`}>
                    {status.replace('_', ' ')}
                  </span>
                </div>
                {c.subject && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted
                    text-muted-foreground">
                    {c.subject}
                  </span>
                )}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{c.progressPercent}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${c.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
