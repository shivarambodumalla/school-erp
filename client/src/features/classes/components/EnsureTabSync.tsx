'use client'

import { useEffect } from 'react'
import { ensureClassTab } from './ClassTabBar'

interface Props {
  classYearId: string
  type: 'subject' | 'student'
  item: { id: string; name: string }
}

export function EnsureTabSync({ classYearId, type, item }: Props) {
  useEffect(() => {
    ensureClassTab(classYearId, type, item)
  }, [classYearId, type, item.id, item.name])

  return null
}
