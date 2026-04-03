'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, AlertTriangle, Users, LayoutGrid, BookOpen, Calendar } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { generateColor } from '@/lib/colors'

interface ClassPageHeaderProps {
  classData: {
    id: string
    serialNo: number
    classTemplate: { name: string; gradeLevel: number }
    academicYear: { id: string; name: string }
    status: string
    _count: { sections: number; subjects: number; studentSections: number }
  }
  academicYears: {
    classYearId: string
    serialNo: number
    academicYearName: string
    isCurrent: boolean
    status: string
  }[]
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-amber-100 text-amber-700',
  ARCHIVED: 'bg-gray-100 text-gray-600',
}

function gradeColor(name: string, level: number): string {
  return generateColor(name || String(level))
}

export function ClassPageHeader({ classData, academicYears }: ClassPageHeaderProps) {
  const router = useRouter()
  const [yearOpen, setYearOpen] = useState(false)

  const { classTemplate, academicYear, status, _count } = classData
  const hasMultipleYears = academicYears.length > 1
  const statusStyle = STATUS_STYLES[status]
  const isArchived = status === 'ARCHIVED'

  return (
    <div className="space-y-4">
      {/* Archived banner */}
      {isArchived && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Viewing archived year <strong>{academicYear.name}</strong> — read only
        </div>
      )}

      {/* Hero card */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-start gap-4">
          {/* Grade avatar */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-gray-800 text-xl font-bold" style={{ backgroundColor: gradeColor(classTemplate.name, classTemplate.gradeLevel) }}>
            {classTemplate.gradeLevel}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold">{classTemplate.name}</h1>
              {/* Year switcher */}
              {hasMultipleYears ? (
                <Popover open={yearOpen} onOpenChange={setYearOpen}>
                  <PopoverTrigger asChild>
                    <button type="button"
                      className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/80 transition-colors">
                      <Calendar className="h-3 w-3" />
                      {academicYear.name}
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-56 p-1">
                    {academicYears.map(y => (
                      <button key={y.classYearId} type="button"
                        onClick={() => { router.push(`/management/institution/classes/${y.serialNo}`); setYearOpen(false) }}
                        className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors min-h-[36px] ${
                          y.classYearId === classData.id
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'hover:bg-muted'
                        }`}>
                        <span>{y.academicYearName}</span>
                        {y.isCurrent && (
                          <span className="text-[10px] rounded-full bg-green-100 text-green-700 px-1.5 py-0.5 font-medium">Current</span>
                        )}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {academicYear.name}
                </span>
              )}
              {statusStyle && (
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${statusStyle}`}>
                  {status}
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-2.5">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>{_count.sections} {_count.sections === 1 ? 'section' : 'sections'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>{_count.studentSections} {_count.studentSections === 1 ? 'student' : 'students'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <BookOpen className="h-3.5 w-3.5" />
                <span>{_count.subjects} {_count.subjects === 1 ? 'subject' : 'subjects'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
