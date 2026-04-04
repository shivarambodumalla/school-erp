'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import Link from 'next/link'

interface TabItem {
  id: string
  serialNo: number
  name: string
}

interface Props {
  classSerialNo: number
  classYearId: string
  className: string
}

function loadSubjectTabs(classYearId: string): TabItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(`onflows-class-${classYearId}-subject-tabs`)
    if (!raw) return []
    const parsed = JSON.parse(raw) as { tabs: TabItem[] }
    return Array.isArray(parsed.tabs) ? parsed.tabs : []
  } catch { return [] }
}

function saveSubjectTabs(classYearId: string, tabs: TabItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(`onflows-class-${classYearId}-subject-tabs`, JSON.stringify({ tabs, activeId: null }))
}

/**
 * Shows opened subject/student tabs above the class header.
 * Only renders when there are actually opened tabs.
 * First tab is always the class name (links back to class home).
 */
export function ClassOpenItemsBar({ classSerialNo, classYearId, className }: Props) {
  const pathname = usePathname()
  const [subjectTabs, setSubjectTabs] = useState<TabItem[]>([])

  const classHomePath = `/management/institution/classes/${classSerialNo}`
  const isOnClassHome = pathname === classHomePath || pathname === `${classHomePath}/`

  useEffect(() => {
    setSubjectTabs(loadSubjectTabs(classYearId))
  }, [classYearId])

  // Re-sync on pathname change (tab might have been added by SubjectsListContent)
  useEffect(() => {
    setSubjectTabs(loadSubjectTabs(classYearId))
  }, [classYearId, pathname])

  const closeSubjectTab = (tabId: string) => {
    setSubjectTabs(prev => {
      const next = prev.filter(t => t.id !== tabId)
      saveSubjectTabs(classYearId, next)
      return next
    })
  }

  // Don't render if no opened tabs
  if (subjectTabs.length === 0) return null

  return (
    <div className="border-b bg-muted/30 overflow-x-auto scrollbar-none">
      <div className="flex items-center min-w-max">
        {/* Class home tab — always first */}
        <Link
          href={classHomePath}
          className={`shrink-0 px-3 py-1.5 text-sm font-medium border-b-2 -mb-px transition-colors min-h-[36px] flex items-center
            ${isOnClassHome
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
        >
          {className}
        </Link>

        {/* Opened subject tabs */}
        {subjectTabs.map(tab => (
          <div
            key={tab.id}
            className="shrink-0 flex items-center gap-1 pl-2.5 pr-1 h-9
              border-b-2 -mb-px transition-colors group border-transparent
              text-muted-foreground hover:text-foreground"
          >
            <Link
              href={`/management/subjects/${tab.serialNo}`}
              className="text-sm font-medium truncate max-w-[100px]"
              title={tab.name}
            >
              {tab.name}
            </Link>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); closeSubjectTab(tab.id) }}
              className="p-0.5 rounded transition-colors
                text-muted-foreground/40 hover:text-foreground hover:bg-muted
                opacity-0 group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
