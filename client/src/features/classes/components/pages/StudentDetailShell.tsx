'use client'

import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { ClassTabBar, ensureClassTab } from '../ClassTabBar'
import { StudentSubTabBar } from '../StudentSubTabBar'

interface Props {
  classYearId: string
  studentId: string
  children: ReactNode
}

export function StudentDetailShell({ classYearId, studentId, children }: Props) {
  useEffect(() => {
    ensureClassTab(classYearId, 'student', { id: studentId, name: 'Student #' + studentId })
  }, [classYearId, studentId])

  return (
    <div className="space-y-0">
      <ClassTabBar classYearId={classYearId} type="student" activeId={studentId} />
      <StudentSubTabBar classYearId={classYearId} studentId={studentId} />
      <div className="pt-4">{children}</div>
    </div>
  )
}
