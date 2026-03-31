'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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

interface ClassTabBarProps {
  classYearId: string
  type: 'subject' | 'student'
  /** Currently active item ID from URL (null = "All" tab) */
  activeId: string | null
}

function storageKey(classYearId: string, type: string) {
  return `onflows-class-${classYearId}-${type}-tabs`
}

function loadTabs(classYearId: string, type: string): StoredTabs {
  if (typeof window === 'undefined') return { tabs: [], activeId: null }
  try {
    const raw = localStorage.getItem(storageKey(classYearId, type))
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

function saveTabs(classYearId: string, type: string, data: StoredTabs) {
  if (typeof window === 'undefined') return
  localStorage.setItem(storageKey(classYearId, type), JSON.stringify(data))
}

export function ClassTabBar({ classYearId, type, activeId }: ClassTabBarProps) {
  const router = useRouter()
  const [tabs, setTabs] = useState<TabItem[]>([])

  const basePath = `/management/institution/classes/${classYearId}`
  const allPath = type === 'subject' ? `${basePath}/subjects` : `${basePath}/students`
  const itemPath = (id: string) =>
    type === 'subject' ? `${basePath}/subjects/${id}` : `${basePath}/students/${id}`

  // Load tabs from localStorage on mount
  useEffect(() => {
    const stored = loadTabs(classYearId, type)
    setTabs(stored.tabs)
  }, [classYearId, type])

  // Persist whenever tabs change
  const persistTabs = useCallback((newTabs: TabItem[], newActiveId: string | null) => {
    saveTabs(classYearId, type, { tabs: newTabs, activeId: newActiveId })
  }, [classYearId, type])

  const closeTab = useCallback((tabId: string) => {
    setTabs(prev => {
      const next = prev.filter(t => t.id !== tabId)
      persistTabs(next, activeId === tabId ? null : activeId)
      // If closing the active tab, navigate back to "All"
      if (activeId === tabId) {
        router.push(allPath)
      }
      return next
    })
  }, [activeId, allPath, router, persistTabs])

  // No tabs open and not viewing an item — nothing to render
  if (tabs.length === 0 && !activeId) return null

  return (
    <div className="border-b bg-muted/30 overflow-x-auto scrollbar-none">
      <div className="flex items-center min-w-max">
        {/* Pinned "All" tab */}
        <button type="button"
          onClick={() => router.push(allPath)}
          className={`shrink-0 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors min-h-[40px]
            ${!activeId
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}>
          All {type === 'subject' ? 'Subjects' : 'Students'}
        </button>

        {/* Opened item tabs */}
        {tabs.map(tab => (
          <div key={tab.id}
            className={`shrink-0 flex items-center gap-1 pl-3 pr-1 h-10
              border-b-2 -mb-px transition-colors group
              ${activeId === tab.id
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}>
            <button type="button"
              onClick={() => router.push(itemPath(tab.id))}
              className="text-sm font-medium truncate max-w-[120px]"
              title={tab.name}>
              {tab.name}
            </button>
            <button type="button"
              onClick={(e) => { e.stopPropagation(); closeTab(tab.id) }}
              className={`p-0.5 rounded transition-colors
                ${activeId === tab.id
                  ? 'text-foreground/60 hover:text-foreground hover:bg-muted'
                  : 'text-muted-foreground/40 hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100'
                }`}>
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Ensures an item is in the localStorage tab list.
 * Does NOT navigate — call router.push separately if needed.
 */
export function ensureClassTab(
  classYearId: string,
  type: 'subject' | 'student',
  item: TabItem,
) {
  const stored = loadTabs(classYearId, type)
  let tabs = stored.tabs

  if (tabs.some(t => t.id === item.id)) {
    saveTabs(classYearId, type, { tabs, activeId: item.id })
    return
  }

  tabs = [...tabs, item]
  if (tabs.length > MAX_EXTRA_TABS) {
    const removed = tabs.shift()
    if (removed) {
      toast.info(`Tab "${removed.name}" closed to make room`, { duration: 2000 })
    }
  }

  saveTabs(classYearId, type, { tabs, activeId: item.id })
}

/**
 * Call this when a subject/student is clicked in the list.
 * Adds the item to localStorage tabs and navigates to it.
 */
export function openClassTab(
  classYearId: string,
  type: 'subject' | 'student',
  item: TabItem,
  router: ReturnType<typeof useRouter>,
) {
  ensureClassTab(classYearId, type, item)

  const basePath = `/management/institution/classes/${classYearId}`
  router.push(type === 'subject' ? `${basePath}/subjects/${item.id}` : `${basePath}/students/${item.id}`)
}
