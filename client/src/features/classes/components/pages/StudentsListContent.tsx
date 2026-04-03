'use client'

import { useRouter, usePathname } from 'next/navigation'
import { ClassStudentsTab } from '../tabs/ClassStudentsTab'
import { ensureStudentTab } from '../StudentInClassTabBar'

interface Props {
  classYearId: string
  sections: { id: string; name: string }[]
}

export function StudentsListContent({ classYearId, sections }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const handleOpenStudent = (serialNo: number, name: string) => {
    // Add to localStorage tabs
    ensureStudentTab(classYearId, { id: String(serialNo), name })
    // Navigate to student within class context
    const basePath = pathname.replace(/\/students.*$/, '/students')
    router.push(`${basePath}/${serialNo}`)
  }

  return (
    <ClassStudentsTab
      classYearId={classYearId}
      sections={sections}
      onOpenStudent={handleOpenStudent}
    />
  )
}
