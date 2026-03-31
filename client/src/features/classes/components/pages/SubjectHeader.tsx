'use client'

import { Badge } from '@/components/ui/badge'
import type { SubjectDetail } from '@/features/subjects/types'

interface Props {
  subject: SubjectDetail
  classYearId: string
}

export function SubjectHeader({ subject }: Props) {
  const classLabel = `${subject.classYear.classTemplate.name}${
    subject.section ? ` - ${subject.section.name}` : ''
  }`

  const teacherNames = subject.teachers
    .map((t) => t.user.email.split('@')[0])
    .join(', ')

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between py-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {subject.name}
        </h1>
        <div className="flex items-center gap-2 mt-1 flex-wrap text-sm text-muted-foreground">
          <Badge variant="secondary">{classLabel}</Badge>
          {subject.code && (
            <Badge variant="outline">{subject.code}</Badge>
          )}
          {teacherNames && <span>{teacherNames}</span>}
        </div>
      </div>
    </div>
  )
}
