'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import {
  ArrowLeft, Loader2, FileText, CalendarCheck,
  MessageSquare, ChevronDown, ChevronUp, Printer,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ReportCardPreview } from './ReportCardPreview'

/* ── Types ─────────────────────────────────────────────────── */

interface GenerationDetail {
  id: string
  classYearId: string
  className: string
  academicYear: string
  examTypeIds: string[]
  includeAttendance: boolean
  includeRemarks: boolean
  gradingScale: Record<string, string> | null
  status: 'DRAFT' | 'GENERATED' | 'PUBLISHED'
  generatedAt: string | null
  publishedAt: string | null
  createdAt: string
}

interface ExamTypeInfo {
  id: string
  name: string
  shortName: string
}

interface SubjectInfo {
  id: string
  name: string
}

interface InstitutionInfo {
  name: string
  logoUrl: string | null
  addressLine1: string | null
  city: string | null
  state: string | null
  pinCode: string | null
  phone: string | null
}

interface CardItem {
  id: string
  studentId: string
  studentName: string
  rollNo: string | null
  photoUrl: string | null
  remarks: string | null
  pdfUrl: string | null
}

interface GradeEntryItem {
  studentId: string
  subjectId: string
  examTypeId: string
  marksObtained: number
  totalMarks: number
}

interface AttendanceSummary {
  [studentId: string]: { total: number; present: number }
}

/* ── Status badge ─────────────────────────────────────────── */

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

interface ReportCardDetailProps {
  generationId: string
}

export function ReportCardDetail({ generationId }: ReportCardDetailProps) {
  const router = useRouter()
  const { apiParam } = useInstitutionId()

  const [loading, setLoading] = useState(true)
  const [generation, setGeneration] = useState<GenerationDetail | null>(null)
  const [examTypes, setExamTypes] = useState<ExamTypeInfo[]>([])
  const [subjects, setSubjects] = useState<SubjectInfo[]>([])
  const [institution, setInstitution] = useState<InstitutionInfo | null>(null)
  const [cards, setCards] = useState<CardItem[]>([])
  const [gradeEntries, setGradeEntries] = useState<GradeEntryItem[]>([])
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary>({})
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  /* ── Fetch detail ──────────────────────────────────────── */

  const fetchDetail = useCallback(async () => {
    try {
      const url = `/api/school/report-cards/${generationId}${apiParam}`
      const res = await fetch(url)
      if (!res.ok) {
        if (res.status === 404) router.push('/management/report-cards')
        return
      }

      const data = await res.json() as {
        generation: GenerationDetail
        examTypes: ExamTypeInfo[]
        subjects: SubjectInfo[]
        institution: InstitutionInfo
        cards: CardItem[]
        gradeEntries: GradeEntryItem[]
        attendanceSummary: AttendanceSummary
      }

      setGeneration(data.generation)
      setExamTypes(data.examTypes)
      setSubjects(data.subjects)
      setInstitution(data.institution)
      setCards(data.cards)
      setGradeEntries(data.gradeEntries)
      setAttendanceSummary(data.attendanceSummary)
    } catch (err) {
      console.error('Failed to fetch detail:', err)
    } finally {
      setLoading(false)
    }
  }, [generationId, apiParam, router])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  /* ── Generate action ───────────────────────────────────── */

  const handleGenerate = async () => {
    if (!confirm('Generate report cards for all students in this class?')) return
    setActionLoading(true)
    try {
      const res = await fetch(
        `/api/school/report-cards/${generationId}/generate${apiParam}`,
        { method: 'POST' },
      )
      if (res.ok) {
        await fetchDetail()
      } else {
        const err = await res.json() as { error: string }
        alert(err.error ?? 'Generation failed')
      }
    } catch (err) {
      console.error('Generate failed:', err)
    } finally {
      setActionLoading(false)
    }
  }

  /* ── Publish action ────────────────────────────────────── */

  const handlePublish = async () => {
    if (!confirm('Publish these report cards? They will be visible to parents and students.')) return
    setActionLoading(true)
    try {
      const res = await fetch(
        `/api/school/report-cards/${generationId}/publish${apiParam}`,
        { method: 'POST' },
      )
      if (res.ok) {
        await fetchDetail()
      } else {
        const err = await res.json() as { error: string }
        alert(err.error ?? 'Publish failed')
      }
    } catch (err) {
      console.error('Publish failed:', err)
    } finally {
      setActionLoading(false)
    }
  }

  /* ── Build subject rows for a student ──────────────────── */

  const buildSubjectRows = (studentId: string) => {
    const studentGrades = gradeEntries.filter((ge) => ge.studentId === studentId)

    return subjects.map((subj) => {
      const marks = examTypes.map((et) => {
        const entry = studentGrades.find(
          (ge) => ge.subjectId === subj.id && ge.examTypeId === et.id,
        )
        return {
          examTypeName: et.name,
          obtained: entry?.marksObtained ?? 0,
          total: entry?.totalMarks ?? 0,
        }
      })

      return {
        subjectName: subj.name,
        marks,
        totalObtained: marks.reduce((s, m) => s + m.obtained, 0),
        totalPossible: marks.reduce((s, m) => s + m.total, 0),
      }
    })
  }

  /* ── Student summary row ───────────────────────────────── */

  const getStudentSummary = (studentId: string) => {
    const studentGrades = gradeEntries.filter((ge) => ge.studentId === studentId)
    const totalObtained = studentGrades.reduce((s, ge) => s + ge.marksObtained, 0)
    const totalPossible = studentGrades.reduce((s, ge) => s + ge.totalMarks, 0)
    const percentage = totalPossible > 0
      ? ((totalObtained / totalPossible) * 100).toFixed(1)
      : '0.0'

    return { totalObtained, totalPossible, percentage }
  }

  /* ── Print preview ─────────────────────────────────────── */

  const handlePrint = (cardId: string) => {
    setExpandedCardId(cardId)
    // Wait for render then print
    setTimeout(() => window.print(), 300)
  }

  /* ── Render ────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!generation || !institution) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center">
        <FileText className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-muted-foreground">Report card not found</p>
      </div>
    )
  }

  const examTypeNames = examTypes.map((et) => et.name)

  return (
    <div className="space-y-6 print:space-y-0">
      {/* Back + header — hide on print */}
      <div className="print:hidden">
        <button
          onClick={() => router.push('/management/report-cards')}
          className="flex items-center gap-1 text-sm text-muted-foreground
            hover:text-foreground mb-4 min-h-[44px]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Report Cards
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {generation.className}
              </h1>
              {statusBadge(generation.status)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {generation.academicYear}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {generation.status === 'DRAFT' && (
              <Button
                onClick={handleGenerate}
                disabled={actionLoading}
                className="min-h-[44px]"
              >
                {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Generate
              </Button>
            )}
            {generation.status === 'GENERATED' && (
              <Button
                onClick={handlePublish}
                disabled={actionLoading}
                className="min-h-[44px] bg-green-600 hover:bg-green-700"
              >
                {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Publish
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Config info — hide on print */}
      <div className="rounded-xl border bg-card p-4 space-y-3 print:hidden">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Configuration
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Exam Types</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {examTypes.map((et) => (
                <span
                  key={et.id}
                  className="inline-block rounded-md bg-muted px-2 py-0.5 text-xs"
                >
                  {et.name}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Attendance</span>
            <div className="flex items-center gap-1 mt-1">
              <CalendarCheck className="h-3.5 w-3.5" />
              {generation.includeAttendance ? 'Included' : 'Not included'}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Remarks</span>
            <div className="flex items-center gap-1 mt-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {generation.includeRemarks ? 'Included' : 'Not included'}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Created</span>
            <div className="mt-1">
              {new Date(generation.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Student cards */}
      {cards.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center print:hidden">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            {generation.status === 'DRAFT'
              ? 'Click "Generate" to create report cards for all students.'
              : 'No student cards found.'}
          </p>
        </div>
      ) : (
        <>
          {/* Student summary table — hide on print */}
          <div className="rounded-xl border bg-card print:hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold">
                Students ({cards.length})
              </h2>
            </div>

            {/* Mobile cards / desktop table */}
            <div className="divide-y">
              {cards.map((card) => {
                const summary = getStudentSummary(card.studentId)
                const isExpanded = expandedCardId === card.id

                return (
                  <div key={card.id}>
                    {/* Summary row */}
                    <button
                      onClick={() =>
                        setExpandedCardId(isExpanded ? null : card.id)
                      }
                      className="w-full flex items-center gap-3 px-4 py-3
                        text-left hover:bg-muted/50 transition-colors min-h-[44px]"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            {card.studentName}
                          </span>
                          {card.rollNo && (
                            <span className="text-xs text-muted-foreground shrink-0">
                              #{card.rollNo}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-0.5">
                          <span>
                            {summary.totalObtained}/{summary.totalPossible}
                          </span>
                          <span>{summary.percentage}%</span>
                          {card.remarks && (
                            <span className="truncate max-w-[150px]">
                              {card.remarks}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePrint(card.id)
                          }}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {/* Expanded preview */}
                    {isExpanded && (
                      <div className="border-t bg-muted/30 p-4">
                        <ReportCardPreview
                          institution={institution}
                          studentName={card.studentName}
                          rollNo={card.rollNo}
                          className={generation.className}
                          academicYear={generation.academicYear}
                          subjects={buildSubjectRows(card.studentId)}
                          examTypeNames={examTypeNames}
                          attendance={
                            generation.includeAttendance
                              ? attendanceSummary[card.studentId] ?? null
                              : null
                          }
                          remarks={card.remarks}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Print-only: render the expanded card for printing */}
          {expandedCardId && (
            <div className="hidden print:block">
              {(() => {
                const card = cards.find((c) => c.id === expandedCardId)
                if (!card) return null
                return (
                  <ReportCardPreview
                    institution={institution}
                    studentName={card.studentName}
                    rollNo={card.rollNo}
                    className={generation.className}
                    academicYear={generation.academicYear}
                    subjects={buildSubjectRows(card.studentId)}
                    examTypeNames={examTypeNames}
                    attendance={
                      generation.includeAttendance
                        ? attendanceSummary[card.studentId] ?? null
                        : null
                    }
                    remarks={card.remarks}
                  />
                )
              })()}
            </div>
          )}
        </>
      )}
    </div>
  )
}
