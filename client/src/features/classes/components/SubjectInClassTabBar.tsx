'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { toast } from 'sonner'

const MAX_EXTRA_TABS = 5

interface TabItem {
  id: string       // CUID for internal use
  serialNo: number // for URL display
  name: string
}

interface StoredTabs {
  tabs: TabItem[]
  activeId: string | null
}

interface SubjectInClassTabBarProps {
  classSerialNo: number
  classYearId: string
}

function storageKey(classYearId: string) {
  return `onflows-class-${classYearId}-subject-tabs`
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

export function ensureSubjectTab(classYearId: string, item: TabItem) {
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

export function SubjectInClassTabBar({ classSerialNo, classYearId }: SubjectInClassTabBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [tabs, setTabs] = useState<TabItem[]>([])

  const basePath = `/management/institution/classes/${classSerialNo}`
  const allSubjectsPath = `${basePath}/subjects`
  // Subjects open inside the class frame
  const subjectPath = (serialNo: number) => `${basePath}/subjects/${serialNo}`

  // Extract active subject serialNo from URL
  const subjectsPrefix = `${basePath}/subjects/`
  const isOnSubjectDetail = pathname.startsWith(subjectsPrefix)
  const activeSubjectParam = isOnSubjectDetail
    ? pathname.slice(subjectsPrefix.length).split('/')[0] || null
    : null

  // Find the matching tab by serialNo (URL param) or id
  const activeTab = activeSubjectParam
    ? tabs.find(t => String(t.serialNo) === activeSubjectParam || t.id === activeSubjectParam)
    : null

  useEffect(() => {
    const stored = loadTabs(classYearId)
    setTabs(stored.tabs)
  }, [classYearId])

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
      persistTabs(next, activeTab?.id === tabId ? null : (activeTab?.id ?? null))
      if (activeTab?.id === tabId) {
        router.push(allSubjectsPath)
      }
      return next
    })
  }, [activeTab, allSubjectsPath, router, persistTabs])

  if (tabs.length === 0 && !activeSubjectParam) return null

  return (
    <div className="border-b bg-muted/30 overflow-x-auto scrollbar-none px-4 md:px-6">
      <div className="flex items-center min-w-max">
        <button
          type="button"
          onClick={() => router.push(allSubjectsPath)}
          className={`shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors min-h-[44px]
            ${!activeSubjectParam
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
        >
          All Subjects
        </button>

        {tabs.map(tab => {
          const isActive = activeTab?.id === tab.id
          return (
            <div
              key={tab.id}
              className={`shrink-0 flex items-center gap-1 pl-3 pr-1 h-10
                border-b-2 -mb-px transition-colors group
                ${isActive
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              <button
                type="button"
                onClick={() => router.push(subjectPath(tab.serialNo))}
                className="text-sm font-medium truncate max-w-[120px]"
                title={tab.name}
              >
                {tab.name}
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); closeTab(tab.id) }}
                className={`p-0.5 rounded transition-colors
                  ${isActive
                    ? 'text-foreground/60 hover:text-foreground hover:bg-muted'
                    : 'text-muted-foreground/40 hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100'
                  }`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
