'use client'

import { useRouter, usePathname } from 'next/navigation'
import { SubjectsTab } from '../tabs/SubjectsTab'
import { ensureSubjectTab } from '../SubjectInClassTabBar'

interface Props {
  classYearId: string
}

export function SubjectsListContent({ classYearId }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const handleOpenSubject = (_subjectId: string, subjectName: string, serialNo: number) => {
    // Add to localStorage tabs
    ensureSubjectTab(classYearId, { id: _subjectId, serialNo, name: subjectName })
    // Navigate to subject within class context (not standalone)
    const basePath = pathname.replace(/\/subjects.*$/, '/subjects')
    router.push(`${basePath}/${serialNo}`)
  }

  return (
    <SubjectsTab classYearId={classYearId} onOpenSubject={handleOpenSubject} />
  )
}
