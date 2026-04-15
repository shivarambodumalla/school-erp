'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import {
  FileText, Plus, Loader2, CalendarCheck, MessageSquare,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Sheet, SheetContent, SheetHeader,
  SheetTitle, SheetDescription,
} from '@/components/ui/sheet'

/* ── Types ─────────────────────────────────────────────────── */

interface GenerationItem {
  id: string
  className: string
  academicYear: string
  examTypes: string[]
  includeAttendance: boolean
  includeRemarks: boolean
  status: 'DRAFT' | 'GENERATED' | 'PUBLISHED'
  cardCount: number
  generatedAt: string | null
  publishedAt: string | null
  createdAt: string
}

interface ClassYearOption {
  id: string
  name: string
}

interface AcademicYearOption {
  id: string
  name: string
}

interface ExamTypeOption {
  id: string
  name: string
}

/* ── Status badge helper ──────────────────────────────────── */

function statusBadge(status: string) {
  switch (status) {
    case 'DRAFT':
      return <Badge variant="outline">Draft</Badge>
    case 'GENERATED':
      return <Badge variant="secondary">Generated</Badge>
    case 'PUBLISHED':
      return <Badge className="bg-green-600 text-white hover:bg-green-700">Published</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

/* ── Main component ───────────────────────────────────────── */

export function ReportCardClient() {
  const router = useRouter()
  const { apiParam } = useInstitutionId()

  const [generations, setGenerations] = useState<GenerationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showSheet, setShowSheet] = useState(false)
  const [creating, setCreating] = useState(false)
  const [search, setSearch] = useState('')

  // Form state
  const [classYears, setClassYears] = useState<ClassYearOption[]>([])
  const [academicYears, setAcademicYears] = useState<AcademicYearOption[]>([])
  const [examTypes, setExamTypes] = useState<ExamTypeOption[]>([])
  const [formClassYearId, setFormClassYearId] = useState('')
  const [formAcademicYearId, setFormAcademicYearId] = useState('')
  const [formExamTypeIds, setFormExamTypeIds] = useState<string[]>([])
  const [formIncludeAttendance, setFormIncludeAttendance] = useState(true)
  const [formIncludeRemarks, setFormIncludeRemarks] = useState(true)

  /* ── Fetch generations ─────────────────────────────────── */

  const fetchGenerations = useCallback(async () => {
    try {
      const res = await fetch(`/api/school/report-cards${apiParam}`)
      if (res.ok) {
        const data = await res.json() as { generations: GenerationItem[] }
        setGenerations(data.generations)
      }
    } catch (err) {
      console.error('Failed to fetch generations:', err)
    } finally {
      setLoading(false)
    }
  }, [apiParam])

  useEffect(() => {
    fetchGenerations()
  }, [fetchGenerations])

  /* ── Fetch form options ────────────────────────────────── */

  const fetchFormOptions = useCallback(async () => {
    try {
      const [cyRes, ayRes, etRes] = await Promise.all([
        fetch(`/api/school/classes${apiParam}`),
        fetch(`/api/school/academic-years${apiParam}`),
        fetch(`/api/school/classes/exam-types${apiParam || '?'}${apiParam ? '&' : ''}all=true`),
      ])

      if (cyRes.ok) {
        const data = await cyRes.json() as { classYears?: ClassYearOption[] }
        setClassYears(data.classYears ?? [])
      }
      if (ayRes.ok) {
        const data = await ayRes.json() as { years?: AcademicYearOption[] }
        setAcademicYears(data.years ?? [])
      }
      if (etRes.ok) {
        const data = await etRes.json() as { examTypes?: ExamTypeOption[] }
        setExamTypes(data.examTypes ?? [])
      }
    } catch (err) {
      console.error('Failed to fetch form options:', err)
    }
  }, [apiParam])

  useEffect(() => {
    if (showSheet) fetchFormOptions()
  }, [showSheet, fetchFormOptions])

  /* ── Create generation ─────────────────────────────────── */

  const handleCreate = async () => {
    if (!formClassYearId || !formAcademicYearId || formExamTypeIds.length === 0) return
    setCreating(true)
    try {
      const res = await fetch(`/api/school/report-cards${apiParam}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classYearId: formClassYearId,
          academicYearId: formAcademicYearId,
          examTypeIds: formExamTypeIds,
          includeAttendance: formIncludeAttendance,
          includeRemarks: formIncludeRemarks,
        }),
      })

      if (res.ok) {
        const data = await res.json() as { generation: { id: string } }
        setShowSheet(false)
        resetForm()
        router.push(`/management/report-cards/${data.generation.id}`)
      } else {
        const err = await res.json() as { error: string }
        alert(err.error ?? 'Failed to create')
      }
    } catch (err) {
      console.error('Failed to create generation:', err)
    } finally {
      setCreating(false)
    }
  }

  const resetForm = () => {
    setFormClassYearId('')
    setFormAcademicYearId('')
    setFormExamTypeIds([])
    setFormIncludeAttendance(true)
    setFormIncludeRemarks(true)
  }

  const toggleExamType = (id: string) => {
    setFormExamTypeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  /* ── Filter ────────────────────────────────────────────── */

  const filtered = search
    ? generations.filter(
        (g) =>
          g.className.toLowerCase().includes(search.toLowerCase()) ||
          g.academicYear.toLowerCase().includes(search.toLowerCase()),
      )
    : generations

  /* ── Render ────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Report Cards</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generate and publish student report cards
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-48"
          />
          <Button
            onClick={() => setShowSheet(true)}
            className="min-h-[44px] min-w-[44px] shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">New Report Card</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Generations grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            {search ? 'No matching report cards found' : 'No report cards yet. Create one to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((g) => (
            <button
              key={g.id}
              onClick={() => router.push(`/management/report-cards/${g.id}`)}
              className="rounded-xl border bg-card p-4 text-left
                hover:border-primary/50 hover:shadow-sm
                transition-all min-h-[44px] focus:outline-none
                focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-semibold text-base">{g.className}</h3>
                  <p className="text-xs text-muted-foreground">{g.academicYear}</p>
                </div>
                {statusBadge(g.status)}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex flex-wrap gap-1">
                  {g.examTypes.map((et) => (
                    <span
                      key={et}
                      className="inline-block rounded-md bg-muted px-2 py-0.5 text-xs"
                    >
                      {et}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {g.includeAttendance && (
                    <span className="flex items-center gap-1">
                      <CalendarCheck className="h-3 w-3" /> Attendance
                    </span>
                  )}
                  {g.includeRemarks && (
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" /> Remarks
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
                  <span>{g.cardCount} student{g.cardCount !== 1 ? 's' : ''}</span>
                  <span>{new Date(g.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* New Report Card Sheet */}
      <Sheet open={showSheet} onOpenChange={setShowSheet}>
        <SheetContent side="right" className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>New Report Card</SheetTitle>
            <SheetDescription>
              Configure the report card generation settings
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5 mt-6">
            {/* Class select */}
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={formClassYearId} onValueChange={setFormClassYearId}>
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classYears.map((cy) => (
                    <SelectItem key={cy.id} value={cy.id}>
                      {cy.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Academic year select */}
            <div className="space-y-2">
              <Label>Academic Year</Label>
              <Select value={formAcademicYearId} onValueChange={setFormAcademicYearId}>
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((ay) => (
                    <SelectItem key={ay.id} value={ay.id}>
                      {ay.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Exam types multi-select */}
            <div className="space-y-2">
              <Label>Exam Types</Label>
              <div className="rounded-md border p-3 space-y-2 max-h-48 overflow-y-auto">
                {examTypes.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No exam types found</p>
                ) : (
                  examTypes.map((et) => (
                    <label
                      key={et.id}
                      className="flex items-center gap-3 min-h-[44px]
                        px-2 rounded-lg hover:bg-muted cursor-pointer"
                    >
                      <Checkbox
                        checked={formExamTypeIds.includes(et.id)}
                        onCheckedChange={() => toggleExamType(et.id)}
                      />
                      <span className="text-sm">{et.name}</span>
                    </label>
                  ))
                )}
              </div>
              {formExamTypeIds.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {formExamTypeIds.length} exam type{formExamTypeIds.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            {/* Toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between min-h-[44px]">
                <Label htmlFor="include-attendance" className="cursor-pointer">
                  Include Attendance
                </Label>
                <Switch
                  id="include-attendance"
                  checked={formIncludeAttendance}
                  onCheckedChange={setFormIncludeAttendance}
                />
              </div>
              <div className="flex items-center justify-between min-h-[44px]">
                <Label htmlFor="include-remarks" className="cursor-pointer">
                  Include Remarks
                </Label>
                <Switch
                  id="include-remarks"
                  checked={formIncludeRemarks}
                  onCheckedChange={setFormIncludeRemarks}
                />
              </div>
            </div>

            {/* Submit */}
            <Button
              onClick={handleCreate}
              disabled={creating || !formClassYearId || !formAcademicYearId || formExamTypeIds.length === 0}
              className="w-full min-h-[44px]"
            >
              {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Report Card
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
