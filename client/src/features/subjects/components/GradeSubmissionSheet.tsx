'use client'

import { useState } from 'react'
import {
  Loader2,
  FileText,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { SimilarityBadge } from './SimilarityBadge'
import { toast } from 'sonner'

// ─── Types ───

interface AssessmentInfo {
  id: string
  title: string
  totalMarks: number
}

interface SubmissionForGrading {
  id: string
  studentId: string
  studentName: string
  studentPhoto: string | null
  fileUrl: string | null
  textContent: string | null
  submittedAt: string
  isLate: boolean
  marksObtained: number | null
  feedback: string | null
  status: string
  similarityScore: number | null
  similarityMatch: string | null
  rubricScores: Record<string, number> | null
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  assessment: AssessmentInfo
  submissions: SubmissionForGrading[]
  loading: boolean
  subjectId: string
  onGraded: (updated: SubmissionForGrading) => void
}

export function GradeSubmissionSheet({
  open,
  onOpenChange,
  assessment,
  submissions,
  loading,
  subjectId,
  onGraded,
}: Props) {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [marks, setMarks] = useState('')
  const [feedback, setFeedback] = useState('')
  const [saving, setSaving] = useState(false)
  const [bulkGrading, setBulkGrading] = useState(false)

  const current = submissions[selectedIdx] ?? null

  const selectSubmission = (idx: number) => {
    setSelectedIdx(idx)
    const sub = submissions[idx]
    if (sub) {
      setMarks(sub.marksObtained?.toString() ?? '')
      setFeedback(sub.feedback ?? '')
    }
  }

  const handleSave = async (action: 'grade' | 'return') => {
    if (!current) return
    setSaving(true)
    try {
      const res = await fetch(
        `/api/school/subjects/${subjectId}/lms-assignments/${assessment.id}/submissions`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            submissionId: current.id,
            marksObtained: Number(marks),
            feedback: feedback.trim() || undefined,
            action,
          }),
        }
      )
      if (res.ok) {
        const updated: SubmissionForGrading = {
          ...current,
          marksObtained: Number(marks),
          feedback: feedback.trim() || null,
          status: action === 'return' ? 'RETURNED' : 'GRADED',
        }
        onGraded(updated)
        toast.success(
          action === 'return' ? 'Returned to student' : 'Grade saved'
        )
        // Auto-advance to next ungraded
        const nextUngraded = submissions.findIndex(
          (s, i) => i > selectedIdx && s.status !== 'GRADED' && s.status !== 'RETURNED'
        )
        if (nextUngraded >= 0) {
          selectSubmission(nextUngraded)
        }
      } else {
        toast.error('Failed to save grade')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  const handleBulkGrade = async () => {
    setBulkGrading(true)
    try {
      const ungraded = submissions.filter(
        (s) => s.status !== 'GRADED' && s.status !== 'RETURNED'
      )
      for (const sub of ungraded) {
        const res = await fetch(
          `/api/school/subjects/${subjectId}/lms-assignments/${assessment.id}/submissions`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              submissionId: sub.id,
              marksObtained: sub.marksObtained ?? 0,
              action: 'grade',
            }),
          }
        )
        if (res.ok) {
          onGraded({ ...sub, status: 'GRADED' })
        }
      }
      toast.success(`Graded ${ungraded.length} submissions`)
    } catch {
      toast.error('Bulk grading failed')
    } finally {
      setBulkGrading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>{assessment.title}</SheetTitle>
          <SheetDescription>
            {submissions.length} submissions &middot;{' '}
            {submissions.filter((s) => s.status === 'GRADED').length} graded
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No submissions yet.
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            {/* Student navigator */}
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="icon"
                disabled={selectedIdx <= 0}
                onClick={() => selectSubmission(selectedIdx - 1)}
                className="min-h-[44px] min-w-[44px]"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <div className="flex items-center gap-2 text-sm font-medium
                min-w-0">
                <div className="h-8 w-8 rounded-full bg-muted flex
                  items-center justify-center shrink-0">
                  {current?.studentPhoto ? (
                    <img
                      src={current.studentPhoto}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <span className="truncate">
                  {current?.studentName ?? 'Unknown'}
                </span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {selectedIdx + 1}/{submissions.length}
                </span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                disabled={selectedIdx >= submissions.length - 1}
                onClick={() => selectSubmission(selectedIdx + 1)}
                className="min-h-[44px] min-w-[44px]"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Status + similarity */}
            {current && (
              <div className="flex items-center gap-2 flex-wrap">
                <SubmissionStatusBadge status={current.status} />
                {current.isLate && (
                  <span className="text-xs text-orange-600 font-medium">
                    Late
                  </span>
                )}
                {current.similarityScore !== null && (
                  <SimilarityBadge
                    score={current.similarityScore}
                    threshold={30}
                    matchInfo={current.similarityMatch}
                  />
                )}
              </div>
            )}

            {/* Submission content */}
            {current?.fileUrl && (
              <a
                href={current.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary
                  underline min-h-[44px]"
              >
                <FileText className="h-4 w-4 shrink-0" />
                View Submission File
              </a>
            )}

            {current?.textContent && (
              <div className="rounded-lg border bg-muted/30 p-3 text-sm
                max-h-48 overflow-y-auto">
                {current.textContent}
              </div>
            )}

            {/* Grading form */}
            <div className="space-y-3 border-t pt-4">
              <div className="space-y-2">
                <Label>
                  Marks (out of {assessment.totalMarks})
                </Label>
                <Input
                  type="number"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  max={assessment.totalMarks}
                  min={0}
                  className="min-h-[44px]"
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label>Feedback</Label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  placeholder="Optional feedback for the student..."
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleSave('grade')}
                  disabled={saving || !marks}
                  className="flex-1 min-h-[44px]"
                >
                  {saving && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Grade
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSave('return')}
                  disabled={saving || !marks}
                  className="flex-1 min-h-[44px]"
                >
                  Return
                </Button>
              </div>
            </div>

            {/* Bulk grade */}
            <div className="border-t pt-4">
              <Button
                variant="outline"
                onClick={handleBulkGrade}
                disabled={bulkGrading}
                className="w-full min-h-[44px]"
              >
                {bulkGrading && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Grade All Ungraded
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

function SubmissionStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    SUBMITTED: 'bg-blue-100 text-blue-700',
    LATE: 'bg-orange-100 text-orange-700',
    GRADED: 'bg-green-100 text-green-700',
    RETURNED: 'bg-violet-100 text-violet-700',
    MISSING: 'bg-red-100 text-red-700',
  }
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full
        text-xs font-medium
        ${colors[status] ?? 'bg-gray-100 text-gray-700'}`}
    >
      {status}
    </span>
  )
}
