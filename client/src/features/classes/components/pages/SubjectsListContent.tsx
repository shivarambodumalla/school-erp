'use client'

import { useRouter } from 'next/navigation'
import { ClassTabBar, openClassTab } from '../ClassTabBar'
import { SubjectsTab } from '../tabs/SubjectsTab'

interface Props {
  classYearId: string
}

export function SubjectsListContent({ classYearId }: Props) {
  const router = useRouter()

  const handleOpenSubject = (subjectId: string, subjectName: string) => {
    openClassTab(classYearId, 'subject', { id: subjectId, name: subjectName }, router)
  }

  return (
    <div className="space-y-0">
      <ClassTabBar classYearId={classYearId} type="subject" activeId={null} />
      <div className="pt-2">
        <SubjectsTab classYearId={classYearId} onOpenSubject={handleOpenSubject} />
      </div>
    </div>
  )
}
