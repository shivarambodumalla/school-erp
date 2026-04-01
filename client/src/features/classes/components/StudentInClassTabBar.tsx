'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { toast } from 'sonner'

const MAX_EXTRA_TABS = 5

interface TabItem {
  id: string
  name: string
}

interface StoredTabs {
  tabs: TabItem[]
  activeId: string | null
}

interface StudentInClassTabBarProps {
  classSerialNo: number
  classYearId: string
}

function storageKey(classYearId: string) {
  return `onflows-class-${classYearId}-student-tabs`
}

function loadTabs(classYearId: string): StoredTabs {
  if (typeof window === 'undefined') return { tabs: [], activeId: null }
  try {
    const raw = localStorage.getItem(storageKey(classYearId))
    if (!raw) return { tabs: [], activeId: null }
    const parsed = JSON.parse(raw) as StoredTabs
    return {
      tabs: Array.isArray(parsed.tabs) ? parsed.tabs : [],
      activeId: parsed.activeId ?? null,
    }
  } catch {
    return { tabs: [], activeId: null }
  }
}

function saveTabs(classYearId: string, data: StoredTabs) {
  if (typeof window === 'undefined') return
  localStorage.setItem(storageKey(classYearId), JSON.stringify(data))
}

export function ensureStudentTab(classYearId: string, item: TabItem) {
  const stored = loadTabs(classYearId)
  let tabs = stored.tabs

  if (tabs.some(t => t.id === item.id)) {
    saveTabs(classYearId, { tabs, activeId: item.id })
    return
  }

  tabs = [...tabs, item]
  if (tabs.length > MAX_EXTRA_TABS) {
    const removed = tabs.shift()
    if (removed) {
      toast.info(`Tab "${removed.name}" closed to make room`, { duration: 2000 })
    }
  }

  saveTabs(classYearId, { tabs, activeId: item.id })
}

export function StudentInClassTabBar({ classSerialNo, classYearId }: StudentInClassTabBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [tabs, setTabs] = useState<TabItem[]>([])

  const basePath = `/management/institution/classes/${classSerialNo}`
  const allStudentsPath = `${basePath}/students`
  const studentPath = (id: string) => `${basePath}/students/${id}`

  // Extract active studentId from the URL
  const studentsPrefix = `${basePath}/students/`
  const isOnStudentDetail = pathname.startsWith(studentsPrefix)
  const activeStudentId = isOnStudentDetail
    ? pathname.slice(studentsPrefix.length).split('/')[0] || null
    : null

  // Load tabs from localStorage on mount
  useEffect(() => {
    const stored = loadTabs(classYearId)
    setTabs(stored.tabs)
  }, [classYearId])

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorage = () => {
      const stored = loadTabs(classYearId)
      setTabs(stored.tabs)
    }
    window.addEventListener('storage', handleStorage)
    window.addEventListener('focus', handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('focus', handleStorage)
    }
  }, [classYearId])

  // Re-sync tabs when pathname changes
  useEffect(() => {
    const stored = loadTabs(classYearId)
    setTabs(stored.tabs)
  }, [classYearId, pathname])

  const persistTabs = useCallback((newTabs: TabItem[], newActiveId: string | null) => {
    saveTabs(classYearId, { tabs: newTabs, activeId: newActiveId })
  }, [classYearId])

  const closeTab = useCallback((tabId: string) => {
    setTabs(prev => {
      const next = prev.filter(t => t.id !== tabId)
      persistTabs(next, activeStudentId === tabId ? null : activeStudentId)
      if (activeStudentId === tabId) {
        router.push(allStudentsPath)
      }
      return next
    })
  }, [activeStudentId, allStudentsPath, router, persistTabs])

  // Don't render if no tabs open and not on a student detail
  if (tabs.length === 0 && !activeStudentId) return null

  return (
    <div className="border-b bg-muted/30 overflow-x-auto scrollbar-none px-4 md:px-6">
      <div className="flex items-center min-w-max">
        {/* Pinned "All Students" tab */}
        <button
          type="button"
          onClick={() => router.push(allStudentsPath)}
          className={`shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors min-h-[44px]
            ${!activeStudentId
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
        >
          All Students
        </button>

        {/* Opened student tabs */}
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`shrink-0 flex items-center gap-1 pl-3 pr-1 h-10
              border-b-2 -mb-px transition-colors group
              ${activeStudentId === tab.id
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
          >
            <button
              type="button"
              onClick={() => router.push(studentPath(tab.id))}
              className="text-sm font-medium truncate max-w-[120px]"
              title={tab.name}
            >
              {tab.name}
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); closeTab(tab.id) }}
              className={`p-0.5 rounded transition-colors
                ${activeStudentId === tab.id
                  ? 'text-foreground/60 hover:text-foreground hover:bg-muted'
                  : 'text-muted-foreground/40 hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100'
                }`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
