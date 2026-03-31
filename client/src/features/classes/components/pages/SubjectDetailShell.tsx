'use client'

import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { ClassTabBar, ensureClassTab } from '../ClassTabBar'
import { SubjectSubTabBar } from '../SubjectSubTabBar'
import type { SubjectDetail } from '@/features/subjects/types'

interface Props {
  subject: SubjectDetail
  classYearId: string
  children: ReactNode
}

export function SubjectDetailShell({ subject, classYearId, children }: Props) {
  useEffect(() => {
    ensureClassTab(classYearId, 'subject', { id: subject.id, name: subject.name })
  }, [classYearId, subject.id, subject.name])

  const teacherNames = subject.teachers
    .map((t) => t.user.email.split('@')[0])
    .join(', ')

  return (
    <div className="space-y-0">
      <ClassTabBar classYearId={classYearId} type="subject" activeId={subject.id} />
      {/* Subject header */}
      <div className="pt-4 pb-2">
        <h2 className="text-lg font-bold">{subject.name}</h2>
        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
          {subject.code && <Badge variant="outline">{subject.code}</Badge>}
          {teacherNames && <span>{teacherNames}</span>}
        </div>
      </div>
      <SubjectSubTabBar classYearId={classYearId} subjectId={subject.id} />
      <div className="pt-4">{children}</div>
    </div>
  )
}
