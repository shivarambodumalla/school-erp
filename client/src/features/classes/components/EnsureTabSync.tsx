'use client'

import { useEffect } from 'react'
import { ensureSubjectTab } from './SubjectInClassTabBar'
import { ensureStudentTab } from './StudentInClassTabBar'

interface SubjectTabItem {
  id: string
  serialNo: number
  name: string
}

interface StudentTabItem {
  id: string
  name: string
}

interface Props {
  classYearId: string
  type: 'subject' | 'student'
  item: SubjectTabItem | StudentTabItem
}

export function EnsureTabSync({ classYearId, type, item }: Props) {
  useEffect(() => {
    if (type === 'subject' && 'serialNo' in item) {
      ensureSubjectTab(classYearId, item as SubjectTabItem)
    } else if (type === 'student') {
      ensureStudentTab(classYearId, item as StudentTabItem)
    }
  }, [classYearId, type, item])

  return null
}
