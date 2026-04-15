'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import {
  Plus, Search, SlidersHorizontal,
  GraduationCap, Users, LayoutGrid,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { AddClassSheet } from './AddClassSheet'
import { TABLE_CONTAINER_CLASS, TABLE_HEADER_CLASS, LIST_PAGE_CLASS } from '@/lib/table-constants'
import { SortableHeader, toggleSort, sortData, type SortDir } from '@/components/shared/SortableHeader'
import { generateColor, CLASS_STATUS_COLORS } from '@/lib/colors'
import type { ClassTemplate } from '../types'

const STATUS_OPTIONS = ['ACTIVE', 'ARCHIVED', 'DRAFT']


export function ClassesClient() {
  const router = useRouter()
  const { apiParam } = useInstitutionId()

  const [classes, setClasses] = useState<ClassTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [statuses, setStatuses] = useState<string[]>([])

  /* Sort */
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)

  const handleSort = (field: string) => {
    const { field: f, dir: d } = toggleSort(field, sortField, sortDir)
    setSortField(f)
    setSortDir(d)
  }

  const fetchClasses = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/school/classes${apiParam}`)
      if (res.ok) {
        const data = (await res.json()) as ClassTemplate[]
        setClasses(data)
      }
    } catch {
      /* handled by empty state */
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchClasses() }, [fetchClasses])

  const toggleStatus = (s: string) => {
    setStatuses(prev =>
      prev.includes(s) ? prev.filter(v => v !== s) : [...prev, s],
    )
  }

  const activeFilterCount = statuses.length

  const filtered = classes.filter(cls => {
    const status = cls.activeYear?.status ?? 'DRAFT'
    const matchesStatus = statuses.length === 0 || statuses.includes(status)
    const matchesSearch = search === '' ||
      cls.name.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const totalSections = classes.reduce(
    (sum, c) => sum + (c.activeYear?.sectionCount ?? 0), 0
  )
  const totalStudents = classes.reduce(
    (sum, c) => sum + (c.activeYear?.studentCount ?? 0), 0
  )

  const handleClick = (cls: ClassTemplate) => {
    if (!cls.activeYear) return
    router.push(`/management/institution/classes/${cls.activeYear.serialNo}`)
  }

  return (
    <div className={`${LIST_PAGE_CLASS} gap-3`}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight shrink-0">Classes</h1>
          {classes.length > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-primary/15 text-primary px-3 py-0.5 text-sm font-semibold">
              {classes.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2
              h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 w-full sm:w-44 min-h-[44px]" />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="min-h-[44px] min-w-[44px] relative">
                <SlidersHorizontal className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary
                    text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-52 p-0">
              <div className="px-3 py-2.5 border-b">
                <p className="text-sm font-medium">Status</p>
              </div>
              <div className="p-2 space-y-0.5">
                {STATUS_OPTIONS.map(s => (
                  <label key={s}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-md
                      hover:bg-muted/50 cursor-pointer transition-colors">
                    <Checkbox
                      checked={statuses.includes(s)}
                      onCheckedChange={() => toggleStatus(s)}
                    />
                    <span className="text-sm">{s.charAt(0) + s.slice(1).toLowerCase()}</span>
                  </label>
                ))}
              </div>
              {statuses.length > 0 && (
                <div className="px-3 py-2 border-t">
                  <button type="button" onClick={() => setStatuses([])}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Clear all
                  </button>
                </div>
              )}
            </PopoverContent>
          </Popover>
          <Button className="min-h-[44px]" onClick={() => setSheetOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Class
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 shrink-0">
        <StatCard icon={<GraduationCap className="h-5 w-5" />}
          label="Total Classes" value={classes.length} loading={loading} />
        <StatCard icon={<LayoutGrid className="h-5 w-5" />}
          label="Total Sections" value={totalSections} loading={loading} />
        <StatCard icon={<Users className="h-5 w-5" />}
          label="Total Students" value={totalStudents} loading={loading} />
      </div>

      {/* Classes table */}
      {loading ? (
        <div className="rounded-xl border divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-4">
              <div className="h-9 w-9 rounded-lg bg-muted animate-pulse shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-40 rounded bg-muted animate-pulse" />
                <div className="h-3 w-24 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center space-y-2">
          <p className="font-medium">No classes found</p>
          <p className="text-sm text-muted-foreground">
            {search ? 'Try a different search term' : 'Add your first class to get started.'}
          </p>
        </div>
      ) : (
        <div className={TABLE_CONTAINER_CLASS}>
          <table className="w-full text-sm">
            <thead className={TABLE_HEADER_CLASS}>
              <tr className="border-b">
                <SortableHeader label="Class" field="name" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Grade" field="gradeLevel" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Sections" field="sectionCount" currentField={sortField} currentDir={sortDir} onSort={handleSort} className="hidden sm:table-cell" />
                <SortableHeader label="Students" field="studentCount" currentField={sortField} currentDir={sortDir} onSort={handleSort} className="hidden sm:table-cell" />
                <SortableHeader label="Status" field="status" currentField={sortField} currentDir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {sortData(
                filtered.map(c => ({
                  ...c,
                  sectionCount: c.activeYear?.sectionCount ?? 0,
                  studentCount: c.activeYear?.studentCount ?? 0,
                  status: c.activeYear?.status ?? 'DRAFT',
                })),
                sortField,
                sortDir,
              ).map(cls => {
                const status = cls.activeYear?.status ?? 'DRAFT'
                const hasYear = !!cls.activeYear
                return (
                  <tr key={cls.id}
                    onClick={() => handleClick(cls)}
                    className={`border-b last:border-0 transition-colors
                      ${hasYear ? 'cursor-pointer hover:bg-muted/50' : 'opacity-60'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg flex items-center justify-center text-sm font-bold text-gray-800 shrink-0"
                          style={{ backgroundColor: generateColor(cls.name) }}>
                          {cls.gradeLevel}
                        </div>
                        <span className="font-medium">{cls.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{cls.gradeLevel}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {cls.activeYear?.sectionCount ?? 0}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {cls.activeYear?.studentCount ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className={CLASS_STATUS_COLORS[status] ?? ''}>
                        {status}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <AddClassSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onCreated={fetchClasses}
      />
    </div>
  )
}

function StatCard({ icon, label, value, loading }: {
  icon: React.ReactNode
  label: string
  value: number
  loading: boolean
}) {
  return (
    <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary
        flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        {loading ? (
          <div className="h-6 w-10 rounded bg-muted animate-pulse" />
        ) : (
          <p className="text-xl font-bold">{value}</p>
        )}
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
