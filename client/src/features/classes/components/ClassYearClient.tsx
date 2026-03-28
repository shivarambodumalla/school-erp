'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MoreHorizontal, Archive, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { SectionsTab } from './tabs/SectionsTab'
import { SubjectsTab } from './tabs/SubjectsTab'
import { ClassStudentsTab } from './tabs/ClassStudentsTab'
import { PromoteTab } from './tabs/PromoteTab'
import { CloneClassYearSheet } from './CloneClassYearSheet'
import type { SectionData } from '../types'

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-gray-100 text-gray-600',
  DRAFT: 'bg-amber-100 text-amber-700',
}

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

export function ClassYearClient({ classYear }: ClassYearProps) {
  const router = useRouter()
  const { classTemplate, academicYear, status } = classYear
  const statusClass = STATUS_STYLES[status] ?? STATUS_STYLES.DRAFT
  const [menuOpen, setMenuOpen] = useState(false)
  const [showClone, setShowClone] = useState(false)

  const handleArchive = async () => {
    if (!confirm(`Archive ${classTemplate.name} — ${academicYear.name}?`)) return
    const res = await fetch(`/api/school/classes/${classYear.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ARCHIVED' }),
    })
    if (res.ok) { toast.success('Class year archived'); router.refresh() }
    else { const e = await res.json(); toast.error(e.error ?? 'Failed') }
    setMenuOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="h-9 w-9 shrink-0"
          onClick={() => router.push('/management/institution/classes')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3 flex-wrap flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {classTemplate.name} &mdash; {academicYear.name}
          </h1>
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

      {/* Tabs */}
      <Tabs defaultValue="sections">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="sections" className="min-h-[44px]">Sections</TabsTrigger>
          <TabsTrigger value="subjects" className="min-h-[44px]">Subjects</TabsTrigger>
          <TabsTrigger value="students" className="min-h-[44px]">Students</TabsTrigger>
          <TabsTrigger value="promote" className="min-h-[44px]">Promote</TabsTrigger>
        </TabsList>

        <TabsContent value="sections">
          <SectionsTab classYearId={classYear.id} />
        </TabsContent>
        <TabsContent value="subjects">
          <SubjectsTab classYearId={classYear.id}
            sections={classYear.sections.map((s) => ({ id: s.id, name: s.name }))} />
        </TabsContent>
        <TabsContent value="students">
          <ClassStudentsTab
            classYearId={classYear.id}
            sections={classYear.sections.map((s) => ({ id: s.id, name: s.name }))}
          />
        </TabsContent>
        <TabsContent value="promote">
          <PromoteTab classYearId={classYear.id}
            gradeLevel={classTemplate.gradeLevel}
            academicYearName={academicYear.name} />
        </TabsContent>
      </Tabs>

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
