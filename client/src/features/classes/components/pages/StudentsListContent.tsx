'use client'

import { useRouter } from 'next/navigation'
import { ClassTabBar, openClassTab } from '../ClassTabBar'
import { ClassStudentsTab } from '../tabs/ClassStudentsTab'

interface Props {
  classYearId: string
  sections: { id: string; name: string }[]
}

export function StudentsListContent({ classYearId, sections }: Props) {
  const router = useRouter()

  const handleOpenStudent = (serialNo: number, name: string) => {
    openClassTab(classYearId, 'student', { id: String(serialNo), name }, router)
  }

  return (
    <div className="space-y-0">
      <ClassTabBar classYearId={classYearId} type="student" activeId={null} />
      <div className="pt-2">
        <ClassStudentsTab
          classYearId={classYearId}
          sections={sections}
          onOpenStudent={handleOpenStudent}
        />
      </div>
    </div>
  )
}
