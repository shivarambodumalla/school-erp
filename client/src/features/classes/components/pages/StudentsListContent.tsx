'use client'

import { ClassStudentsTab } from '../tabs/ClassStudentsTab'

interface Props {
  classYearId: string
  sections: { id: string; name: string }[]
}

export function StudentsListContent({ classYearId, sections }: Props) {
  return (
    <ClassStudentsTab
      classYearId={classYearId}
      sections={sections}
    />
  )
}
