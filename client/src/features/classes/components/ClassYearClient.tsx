'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { MoreHorizontal, Archive, Copy, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { SectionsTab } from './tabs/SectionsTab'
import { SubjectsTab } from './tabs/SubjectsTab'
import { ClassStudentsTab } from './tabs/ClassStudentsTab'
import { PromoteTab } from './tabs/PromoteTab'
import { CloneClassYearSheet } from './CloneClassYearSheet'
import { SubjectPageClient } from '@/features/subjects/components/SubjectPageClient'
import { StudentDetailInline } from '@/features/students/components/StudentDetailInline'
import type { SectionData } from '../types'
import type { SubjectDetail } from '@/features/subjects/types'
import { CLASS_STATUS_COLORS } from '@/lib/colors'

const TABS = [
  { key: 'sections', label: 'Sections' },
  { key: 'subjects', label: 'Subjects' },
  { key: 'students', label: 'Students' },
  { key: 'promote', label: 'Promote' },
] as const

interface ClassYearProps {
  classYear: {
    id: string
    status: string
    classTemplate: { name: string; gradeLevel: number }
    academicYear: { name: string }
    sections: SectionData[]
    _count: { sections: number; subjects: number }
  }
}

interface OpenedItem {
  id: string
  type: 'subject' | 'student'
  label: string
}

export function ClassYearClient({ classYear }: ClassYearProps) {
  const router = useRouter()
  const { apiParam } = useInstitutionId()
  const confirm = useConfirm()
  const { classTemplate, academicYear, status } = classYear
  const statusClass = CLASS_STATUS_COLORS[status] ?? CLASS_STATUS_COLORS.DRAFT
  const [menuOpen, setMenuOpen] = useState(false)
  const [showClone, setShowClone] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('sections')
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)

  // Level-2 opened items (subjects/students)
  const [openedItems, setOpenedItems] = useState<OpenedItem[]>([])
  const [activeItem, setActiveItem] = useState<string | null>(null)

  // Subject data cache
  const [subjectCache, setSubjectCache] = useState<Record<string, SubjectDetail>>({})

  const handleViewStudents = (sectionId: string) => {
    setSelectedSectionId(sectionId)
    setActiveTab('students')
    setActiveItem(null) // go back to list view
  }

  const handleArchive = async () => {
    const ok = await confirm({
      title: 'Archive Class',
      description: `Archive ${classTemplate.name} — ${academicYear.name}?`,
      note: 'Archived classes become read-only.',
      confirmLabel: 'Archive',
    })
    if (!ok) return
    const res = await fetch(`/api/school/classes/${classYear.id}${apiParam}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ARCHIVED' }),
    })
    if (res.ok) { toast.success('Class year archived'); router.refresh() }
    else { const e = await res.json(); toast.error(e.error ?? 'Failed') }
    setMenuOpen(false)
  }

  // Open a subject inline
  const openSubject = useCallback(async (subjectId: string, subjectName: string) => {
    const item: OpenedItem = { id: subjectId, type: 'subject', label: subjectName }
    setOpenedItems(prev => {
      if (prev.some(i => i.id === subjectId)) return prev
      return [...prev, item]
    })
    setActiveItem(subjectId)
    setActiveTab('subjects')

    // Fetch subject detail if not cached
    if (!subjectCache[subjectId]) {
      try {
        const res = await fetch(`/api/school/subjects/${subjectId}${apiParam}`)
        if (res.ok) {
          const data = await res.json() as SubjectDetail
          setSubjectCache(prev => ({ ...prev, [subjectId]: data }))
        }
      } catch { /* handled by loading state */ }
    }
  }, [apiParam, subjectCache])

  // Open a student inline
  const openStudent = useCallback((studentSerialNo: number, studentName: string) => {
    const key = `student-${studentSerialNo}`
    const item: OpenedItem = { id: key, type: 'student', label: studentName }
    setOpenedItems(prev => {
      if (prev.some(i => i.id === key)) return prev
      return [...prev, item]
    })
    setActiveItem(key)
    setActiveTab('students')
  }, [])

  const closeItem = useCallback((itemId: string) => {
    setOpenedItems(prev => {
      const next = prev.filter(i => i.id !== itemId)
      if (activeItem === itemId) {
        setActiveItem(null) // back to list
      }
      return next
    })
  }, [activeItem])

  // When switching main tabs, deselect the active item
  const handleTabSwitch = (tabKey: string) => {
    setActiveTab(tabKey)
    setActiveItem(null)
  }

  const hasOpenedItems = openedItems.length > 0

  return (
    <div className="space-y-0 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          <h2 className="text-xl font-bold tracking-tight">
            {classTemplate.name} &mdash; {academicYear.name}
          </h2>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
            {status}
          </span>
        </div>
        <div className="relative">
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setMenuOpen(!menuOpen)}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 w-52 rounded-lg border bg-popover shadow-md py-1">
                <button type="button"
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted min-h-[44px]"
                  onClick={() => { setMenuOpen(false); setShowClone(true) }}>
                  <Copy className="h-4 w-4" /> Clone to Next Year
                </button>
                {status !== 'ARCHIVED' && (
                  <button type="button"
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted min-h-[44px] text-amber-600"
                    onClick={handleArchive}>
                    <Archive className="h-4 w-4" /> Archive This Year
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Level 1 tabs — main sections */}
      <div className="border-b">
        <div className="flex gap-0">
          {TABS.map(tab => (
            <button key={tab.key} type="button"
              onClick={() => handleTabSwitch(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors min-h-[44px]
                ${activeTab === tab.key && !activeItem
                  ? 'border-primary text-primary'
                  : activeTab === tab.key
                    ? 'border-primary/40 text-primary/60'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Level 2 tabs — opened subjects/students */}
      {hasOpenedItems && (
        <div className="border-b bg-muted/30">
          <div className="flex items-center overflow-x-auto scrollbar-none">
            {openedItems.map(item => (
              <div key={item.id}
                className={`shrink-0 flex items-center gap-1 pl-3 pr-1 h-9
                  border-b-2 transition-colors group
                  ${activeItem === item.id
                    ? 'border-primary text-foreground bg-background'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}>
                <button type="button"
                  onClick={() => {
                    setActiveItem(item.id)
                    setActiveTab(item.type === 'subject' ? 'subjects' : 'students')
                  }}
                  className="text-xs font-medium truncate max-w-[120px]"
                  title={item.label}>
                  {item.label}
                </button>
                <button type="button"
                  onClick={(e) => { e.stopPropagation(); closeItem(item.id) }}
                  className={`p-0.5 rounded transition-colors
                    ${activeItem === item.id
                      ? 'text-foreground/60 hover:text-foreground hover:bg-muted'
                      : 'text-muted-foreground/40 hover:text-foreground hover:bg-muted opacity-0 group-hover:opacity-100'
                    }`}>
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab content */}
      <div className="pt-4">
        {/* If an item is actively selected, show it */}
        {activeItem ? (
          (() => {
            const item = openedItems.find(i => i.id === activeItem)
            if (!item) return null

            if (item.type === 'subject') {
              const subject = subjectCache[item.id]
              if (!subject) return (
                <div className="flex items-center justify-center h-40">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              )
              return <SubjectPageClient subject={subject} />
            }

            if (item.type === 'student') {
              const serialNo = item.id.replace('student-', '')
              return <StudentDetailInline studentId={serialNo} />
            }

            return null
          })()
        ) : (
          <>
            {activeTab === 'sections' && (
              <SectionsTab classYearId={classYear.id} onViewStudents={handleViewStudents} />
            )}
            {activeTab === 'subjects' && (
              <SubjectsTab classYearId={classYear.id}
                sections={classYear.sections.map((s) => ({ id: s.id, name: s.name }))}
                onOpenSubject={openSubject}
              />
            )}
            {activeTab === 'students' && (
              <ClassStudentsTab
                classYearId={classYear.id}
                sections={classYear.sections.map((s) => ({ id: s.id, name: s.name }))}
                initialSectionId={selectedSectionId}
                onOpenStudent={openStudent}
              />
            )}
            {activeTab === 'promote' && (
              <PromoteTab classYearId={classYear.id}
                gradeLevel={classTemplate.gradeLevel}
                academicYearName={academicYear.name} />
            )}
          </>
        )}
      </div>

      {showClone && (
        <CloneClassYearSheet
          classYearId={classYear.id}
          className={classTemplate.name}
          onClose={() => setShowClone(false)}
        />
      )}
    </div>
  )
}
