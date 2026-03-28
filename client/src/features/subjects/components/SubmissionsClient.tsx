'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Loader2,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
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
import type { SubmissionData } from '../types'

interface Props {
  subjectId: string
  postId: string
  postTitle: string
  totalMarks: number
  submissions: SubmissionData[]
}

type FilterKey = 'all' | 'submitted' | 'graded' | 'missing'

export function SubmissionsClient({
  subjectId,
  postId,
  postTitle,
  totalMarks,
  submissions: initial,
}: Props) {
  const router = useRouter()
  const [subs, setSubs] = useState(initial)
  const [filter, setFilter] = useState<FilterKey>('all')
  const [grading, setGrading] =
    useState<SubmissionData | null>(null)

  const submitted = subs.filter(
    (s) => s.status === 'SUBMITTED' || s.status === 'LATE'
  ).length
  const graded = subs.filter(
    (s) => s.status === 'GRADED'
  ).length
  const missing = subs.filter(
    (s) => s.status === 'MISSING'
  ).length

  const filtered = subs.filter((s) => {
    if (filter === 'submitted')
      return (
        s.status === 'SUBMITTED' || s.status === 'LATE'
      )
    if (filter === 'graded') return s.status === 'GRADED'
    if (filter === 'missing') return s.status === 'MISSING'
    return true
  })

  const handleGraded = (updated: SubmissionData) => {
    setSubs((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    )
    setGrading(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            router.push(
              `/management/subjects/${subjectId}`
            )
          }
          className="min-h-[44px] min-w-[44px]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">
            Submissions
          </h1>
          <p className="text-sm text-muted-foreground">
            {postTitle}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Submitted"
          value={submitted}
          icon={Clock}
          color="text-blue-600 bg-blue-50"
        />
        <StatCard
          label="Graded"
          value={graded}
          icon={CheckCircle}
          color="text-green-600 bg-green-50"
        />
        <StatCard
          label="Missing"
          value={missing}
          icon={XCircle}
          color="text-red-600 bg-red-50"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 border-b pb-1">
        {(
          [
            { key: 'all', label: 'All' },
            { key: 'submitted', label: 'Submitted' },
            { key: 'graded', label: 'Graded' },
            { key: 'missing', label: 'Missing' },
          ] as const
        ).map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`px-3 py-2 text-sm font-medium
              border-b-2 min-h-[44px]
              ${
                filter === f.key
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground'
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground
          text-center py-8">
          No submissions found.
        </p>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th className="text-left px-4 py-3
                  font-medium">
                  Student
                </th>
                <th className="text-left px-4 py-3
                  font-medium hidden sm:table-cell">
                  Submitted At
                </th>
                <th className="text-left px-4 py-3
                  font-medium">
                  Marks
                </th>
                <th className="text-left px-4 py-3
                  font-medium">
                  Status
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub) => (
                <tr
                  key={sub.id}
                  className="border-b last:border-0"
                >
                  <td className="px-4 py-3 font-medium">
                    {sub.student.firstName}{' '}
                    {sub.student.lastName}
                  </td>
                  <td className="px-4 py-3
                    text-muted-foreground hidden
                    sm:table-cell">
                    {new Date(
                      sub.submittedAt
                    ).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {sub.marksObtained !== null
                      ? `${sub.marksObtained}/${totalMarks}`
                      : '--'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={sub.status} />
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setGrading(sub)}
                      className="min-h-[36px]"
                    >
                      Grade
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {grading && (
        <GradeSheet
          submission={grading}
          totalMarks={totalMarks}
          subjectId={subjectId}
          postId={postId}
          onGraded={handleGraded}
          onClose={() => setGrading(null)}
        />
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: number
  icon: typeof Clock
  color: string
}) {
  return (
    <div className="rounded-xl border bg-card p-4
      flex items-center gap-3">
      <div
        className={`h-10 w-10 rounded-lg flex items-center
          justify-center ${color}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    SUBMITTED: 'bg-blue-100 text-blue-700',
    LATE: 'bg-orange-100 text-orange-700',
    GRADED: 'bg-green-100 text-green-700',
    RETURNED: 'bg-violet-100 text-violet-700',
    MISSING: 'bg-red-100 text-red-700',
  }
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5
        rounded-full text-xs font-medium
        ${colors[status] ?? 'bg-gray-100 text-gray-700'}`}
    >
      {status}
    </span>
  )
}

function GradeSheet({
  submission,
  totalMarks,
  subjectId,
  postId,
  onGraded,
  onClose,
}: {
  submission: SubmissionData
  totalMarks: number
  subjectId: string
  postId: string
  onGraded: (s: SubmissionData) => void
  onClose: () => void
}) {
  const [marks, setMarks] = useState(
    submission.marksObtained?.toString() ?? ''
  )
  const [feedback, setFeedback] = useState(
    submission.feedback ?? ''
  )
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(
        `/api/school/subjects/${subjectId}/posts/${postId}/submissions`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            submissionId: submission.id,
            marksObtained: Number(marks),
            feedback: feedback.trim() || undefined,
          }),
        }
      )
      if (res.ok) {
        onGraded({
          ...submission,
          marksObtained: Number(marks),
          feedback: feedback.trim() || null,
          status: 'GRADED',
        })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md"
      >
        <SheetHeader>
          <SheetTitle>Grade Submission</SheetTitle>
          <SheetDescription>
            {submission.student.firstName}{' '}
            {submission.student.lastName}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 pt-4">
          {submission.fileUrl && (
            <a
              href={submission.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm
                text-primary underline"
            >
              <FileText className="h-4 w-4" />
              View Submission File
            </a>
          )}

          <div className="space-y-2">
            <Label>
              Marks (out of {totalMarks})
            </Label>
            <Input
              type="number"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              max={totalMarks}
              className="min-h-[44px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Feedback</Label>
            <Textarea
              value={feedback}
              onChange={(e) =>
                setFeedback(e.target.value)
              }
              rows={4}
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || !marks}
            className="w-full min-h-[44px]"
          >
            {saving && (
              <Loader2 className="h-4 w-4 mr-2
                animate-spin" />
            )}
            Save Grade
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
