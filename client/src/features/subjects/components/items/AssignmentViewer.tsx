'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Calendar,
  Upload,
  Loader2,
  Clock,
  Users,
  Target,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MarkdownRenderer } from '../MarkdownRenderer'
import type { SubjectModuleItem } from '../../lms-types'

interface Props {
  item: SubjectModuleItem
  subjectId: string
  portalType: string
}

interface SubmissionRecord {
  id: string
  fileUrl: string | null
  notes: string | null
  submittedAt: string
  isLate: boolean
  marksObtained: number | null
  feedback: string | null
  status: string
}

export function AssignmentViewer({
  item,
  subjectId,
  portalType,
}: Props) {
  const isStudent =
    portalType === 'STUDENT' || portalType === 'PARENT'
  const [submissions, setSubmissions] = useState<
    SubmissionRecord[]
  >([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [showSubmitForm, setShowSubmitForm] = useState(false)

  const fetchSubmissions = useCallback(async () => {
    if (!isStudent) return
    setLoadingHistory(true)
    try {
      const res = await fetch(
        `/api/school/subjects/${subjectId}/items/${item.id}/submissions`
      )
      if (res.ok) {
        const data = (await res.json()) as {
          submissions: SubmissionRecord[]
        }
        setSubmissions(data.submissions)
      }
    } catch {
      // Silent fail
    } finally {
      setLoadingHistory(false)
    }
  }, [subjectId, item.id, isStudent])

  useEffect(() => {
    fetchSubmissions()
  }, [fetchSubmissions])

  const isDuePast = item.dueDate
    ? new Date(item.dueDate) < new Date()
    : false

  return (
    <div className="space-y-4">
      {/* Assignment info card */}
      <div className="rounded-xl border bg-card p-5 space-y-4">
        {/* Meta row */}
        <div className="flex flex-wrap gap-3">
          {item.dueDate && (
            <div className="flex items-center gap-1.5 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                Due{' '}
                {new Date(item.dueDate).toLocaleDateString(
                  undefined,
                  {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }
                )}
              </span>
              {isDuePast && (
                <Badge
                  variant="destructive"
                  className="text-xs"
                >
                  Past due
                </Badge>
              )}
            </div>
          )}
          {item.totalMarks !== null && (
            <div className="flex items-center gap-1.5 text-sm">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span>{item.totalMarks} marks</span>
            </div>
          )}
          {item.maxAttempts !== null && (
            <div className="flex items-center gap-1.5 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{item.maxAttempts} attempt(s)</span>
            </div>
          )}
          {item.isGroupAssignment && (
            <div className="flex items-center gap-1.5 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>Group assignment</span>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {item.allowLateSubmission && (
            <Badge variant="outline" className="text-xs">
              Late submissions allowed
            </Badge>
          )}
          {item.enableSimilarityCheck && (
            <Badge variant="outline" className="text-xs">
              Similarity check enabled
            </Badge>
          )}
        </div>

        {/* Instructions */}
        {item.instructions && (
          <div>
            <h3 className="text-sm font-semibold mb-2">
              Instructions
            </h3>
            <MarkdownRenderer content={item.instructions} />
          </div>
        )}
      </div>

      {/* Student: Submit form */}
      {isStudent && (
        <div className="space-y-3">
          {!showSubmitForm ? (
            <Button
              onClick={() => setShowSubmitForm(true)}
              disabled={
                isDuePast && !item.allowLateSubmission
              }
              className="min-h-[44px] gap-2"
            >
              <Upload className="h-4 w-4" />
              Submit Assignment
            </Button>
          ) : (
            <SubmitForm
              subjectId={subjectId}
              itemId={item.id}
              onCancel={() => setShowSubmitForm(false)}
              onSubmitted={() => {
                setShowSubmitForm(false)
                fetchSubmissions()
              }}
            />
          )}
        </div>
      )}

      {/* Submission history */}
      {isStudent && submissions.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">
            Submission History
          </h3>
          {loadingHistory ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-2">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="rounded-lg border bg-card p-3 space-y-1"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">
                      {new Date(
                        sub.submittedAt
                      ).toLocaleString()}
                    </span>
                    {sub.isLate && (
                      <Badge
                        variant="destructive"
                        className="text-xs"
                      >
                        Late
                      </Badge>
                    )}
                    <Badge
                      variant={
                        sub.status === 'GRADED'
                          ? 'default'
                          : 'secondary'
                      }
                      className="text-xs"
                    >
                      {sub.status}
                    </Badge>
                  </div>
                  {sub.marksObtained !== null && (
                    <p className="text-sm font-medium">
                      Score: {sub.marksObtained}
                    </p>
                  )}
                  {sub.feedback && (
                    <p className="text-sm text-muted-foreground">
                      {sub.feedback}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Submit form ───

function SubmitForm({
  subjectId,
  itemId,
  onCancel,
  onSubmitted,
}: {
  subjectId: string
  itemId: string
  onCancel: () => void
  onSubmitted: () => void
}) {
  const [fileUrl, setFileUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await fetch(
        `/api/school/subjects/${subjectId}/items/${itemId}/submissions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileUrl: fileUrl || null,
            notes: notes || null,
          }),
        }
      )
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        throw new Error(data.error ?? 'Submission failed')
      }
      toast.success('Assignment submitted')
      onSubmitted()
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Submission failed'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <h3 className="text-sm font-semibold">
        Submit your work
      </h3>
      <div className="space-y-1.5">
        <Label htmlFor="sub-file">File URL</Label>
        <Input
          id="sub-file"
          type="url"
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          placeholder="https://drive.google.com/..."
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="sub-notes">
          Notes{' '}
          <span className="text-muted-foreground font-normal">
            (optional)
          </span>
        </Label>
        <Textarea
          id="sub-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes..."
          rows={3}
        />
      </div>
      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="min-h-[44px]"
        >
          {submitting && (
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
          )}
          Submit
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          className="min-h-[44px]"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
