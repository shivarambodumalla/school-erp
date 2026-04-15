'use client'

import { useState, useEffect, useCallback } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { SUBMISSION_STATUS_COLORS } from '@/lib/colors'
import {
  Loader2,
  FileText,
  Clock,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GradeSubmissionSheet } from './GradeSubmissionSheet'

// ─── Types ───

interface AssessmentItem {
  id: string
  title: string
  type: 'ASSIGNMENT' | 'QUIZ' | 'PEER'
  moduleName: string | null
  dueDate: string
  status: 'ACTIVE' | 'PAST_DUE' | 'GRADED' | 'DRAFT'
  submittedCount: number
  gradedCount: number
  totalStudents: number
  avgScore: number | null
  totalMarks: number
}

interface StudentAssessmentItem {
  id: string
  title: string
  type: 'ASSIGNMENT' | 'QUIZ' | 'PEER'
  dueDate: string
  status: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'OVERDUE'
  score: number | null
  totalMarks: number
  canResubmit: boolean
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

type TeacherTypeFilter = 'ALL' | 'QUIZ' | 'ASSIGNMENT' | 'PEER'
type TeacherStatusFilter = 'ALL' | 'ACTIVE' | 'PAST_DUE' | 'GRADED'
type StudentStatusFilter = 'ALL' | 'PENDING' | 'SUBMITTED' | 'GRADED' | 'OVERDUE'

// ─── Props ───

interface Props {
  subjectId: string
}

export function AssessmentsView({ subjectId }: Props) {
  const { addParams } = useInstitutionId()
  const [isTeacher, setIsTeacher] = useState(true)
  const [loading, setLoading] = useState(true)

  // Teacher state
  const [assessments, setAssessments] = useState<AssessmentItem[]>([])
  const [typeFilter, setTypeFilter] = useState<TeacherTypeFilter>('ALL')
  const [statusFilter, setStatusFilter] = useState<TeacherStatusFilter>('ALL')
  const [gradingAssessment, setGradingAssessment] = useState<AssessmentItem | null>(null)
  const [submissions, setSubmissions] = useState<SubmissionForGrading[]>([])
  const [loadingSubs, setLoadingSubs] = useState(false)

  // Student state
  const [studentAssessments, setStudentAssessments] = useState<StudentAssessmentItem[]>([])
  const [studentFilter, setStudentFilter] = useState<StudentStatusFilter>('ALL')

  const fetchAssessments = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      addParams(params)
      const res = await fetch(
        `/api/school/subjects/${subjectId}/lms-assignments?${params}`
      )
      if (!res.ok) {
        setAssessments([])
        setStudentAssessments([])
        return
      }
      const data = (await res.json()) as {
        role: 'TEACHER' | 'STUDENT'
        assessments: AssessmentItem[]
        studentAssessments: StudentAssessmentItem[]
      }
      setIsTeacher(data.role === 'TEACHER')
      if (data.role === 'TEACHER') {
        setAssessments(data.assessments ?? [])
      } else {
        setStudentAssessments(data.studentAssessments ?? [])
      }
    } catch {
      setAssessments([])
      setStudentAssessments([])
    } finally {
      setLoading(false)
    }
  }, [subjectId, addParams])

  useEffect(() => {
    fetchAssessments()
  }, [fetchAssessments])

  const openGrading = async (assessment: AssessmentItem) => {
    setGradingAssessment(assessment)
    setLoadingSubs(true)
    try {
      const params = new URLSearchParams()
      addParams(params)
      const res = await fetch(
        `/api/school/subjects/${subjectId}/lms-assignments/${assessment.id}/submissions?${params}`
      )
      if (res.ok) {
        const data = (await res.json()) as { submissions: SubmissionForGrading[] }
        setSubmissions(data.submissions ?? [])
      }
    } finally {
      setLoadingSubs(false)
    }
  }

  const handleGraded = (updated: SubmissionForGrading) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isTeacher) {
    return (
      <TeacherAssessments
        assessments={assessments}
        typeFilter={typeFilter}
        statusFilter={statusFilter}
        onTypeFilter={setTypeFilter}
        onStatusFilter={setStatusFilter}
        onOpenGrading={openGrading}
        gradingAssessment={gradingAssessment}
        submissions={submissions}
        loadingSubs={loadingSubs}
        onCloseGrading={() => setGradingAssessment(null)}
        onGraded={handleGraded}
        subjectId={subjectId}
      />
    )
  }

  return (
    <StudentAssessments
      assessments={studentAssessments}
      filter={studentFilter}
      onFilter={setStudentFilter}
      subjectId={subjectId}
    />
  )
}

// ─── Teacher Assessments ───

function TeacherAssessments({
  assessments,
  typeFilter,
  statusFilter,
  onTypeFilter,
  onStatusFilter,
  onOpenGrading,
  gradingAssessment,
  submissions,
  loadingSubs,
  onCloseGrading,
  onGraded,
  subjectId,
}: {
  assessments: AssessmentItem[]
  typeFilter: TeacherTypeFilter
  statusFilter: TeacherStatusFilter
  onTypeFilter: (f: TeacherTypeFilter) => void
  onStatusFilter: (f: TeacherStatusFilter) => void
  onOpenGrading: (a: AssessmentItem) => void
  gradingAssessment: AssessmentItem | null
  submissions: SubmissionForGrading[]
  loadingSubs: boolean
  onCloseGrading: () => void
  onGraded: (s: SubmissionForGrading) => void
  subjectId: string
}) {
  const typeFilters: { key: TeacherTypeFilter; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'QUIZ', label: 'Quizzes' },
    { key: 'ASSIGNMENT', label: 'Assignments' },
    { key: 'PEER', label: 'Peer' },
  ]

  const statusFilters: { key: TeacherStatusFilter; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'ACTIVE', label: 'Active' },
    { key: 'PAST_DUE', label: 'Past Due' },
    { key: 'GRADED', label: 'Graded' },
  ]

  const filtered = assessments.filter((a) => {
    if (typeFilter !== 'ALL' && a.type !== typeFilter) return false
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false
    return true
  })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Assessments</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {assessments.length} total assessments
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center
        sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {typeFilters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => onTypeFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium
                transition-colors min-h-[36px]
                ${typeFilter === f.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => onStatusFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium
                transition-colors min-h-[36px]
                ${statusFilter === f.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState message="No assessments match the selected filters." />
      ) : (
        <div className="rounded-xl border bg-card overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th className="text-left px-4 py-3 font-medium">Title</th>
                <th className="text-left px-4 py-3 font-medium
                  hidden md:table-cell">Module</th>
                <th className="text-left px-4 py-3 font-medium
                  hidden sm:table-cell">Type</th>
                <th className="text-left px-4 py-3 font-medium">Due Date</th>
                <th className="text-center px-4 py-3 font-medium
                  hidden sm:table-cell">Submitted</th>
                <th className="text-center px-4 py-3 font-medium
                  hidden md:table-cell">Graded</th>
                <th className="text-center px-4 py-3 font-medium
                  hidden md:table-cell">Avg Score</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr
                  key={a.id}
                  className="border-b last:border-0 hover:bg-muted/30
                    cursor-pointer transition-colors"
                  onClick={() => onOpenGrading(a)}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">{a.title}</div>
                    <div className="text-xs text-muted-foreground
                      sm:hidden mt-0.5">
                      {a.type} &middot; {a.submittedCount}/{a.totalStudents}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground
                    hidden md:table-cell">
                    {a.moduleName ?? '\u2014'}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <TypeBadge type={a.type} />
                  </td>
                  <td className="px-4 py-3">
                    <DueDateCell date={a.dueDate} status={a.status} />
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    <span className="text-sm">
                      {a.submittedCount}/{a.totalStudents}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center hidden md:table-cell">
                    {a.gradedCount}/{a.totalStudents}
                  </td>
                  <td className="px-4 py-3 text-center hidden md:table-cell">
                    {a.avgScore !== null ? `${a.avgScore}%` : '\u2014'}
                  </td>
                  <td className="px-4 py-3">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Grading panel */}
      {gradingAssessment && (
        <GradeSubmissionSheet
          open
          onOpenChange={(v) => { if (!v) onCloseGrading() }}
          assessment={gradingAssessment}
          submissions={submissions}
          loading={loadingSubs}
          subjectId={subjectId}
          onGraded={onGraded}
        />
      )}
    </div>
  )
}

// ─── Student Assessments ───

function StudentAssessments({
  assessments,
  filter,
  onFilter,
  subjectId,
}: {
  assessments: StudentAssessmentItem[]
  filter: StudentStatusFilter
  onFilter: (f: StudentStatusFilter) => void
  subjectId: string
}) {
  const filters: { key: StudentStatusFilter; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'SUBMITTED', label: 'Submitted' },
    { key: 'GRADED', label: 'Graded' },
    { key: 'OVERDUE', label: 'Overdue' },
  ]

  const filtered = assessments.filter((a) => {
    if (filter === 'ALL') return true
    return a.status === filter
  })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Assessments</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {assessments.length} total
        </p>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => onFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium
              transition-colors min-h-[36px]
              ${filter === f.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Assessment cards */}
      {filtered.length === 0 ? (
        <EmptyState message="No assessments match the selected filter." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((a) => (
            <StudentAssessmentCard
              key={a.id}
              assessment={a}
              subjectId={subjectId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function StudentAssessmentCard({
  assessment,
  subjectId,
}: {
  assessment: StudentAssessmentItem
  subjectId: string
}) {
  const dueDate = new Date(assessment.dueDate)
  const now = new Date()
  const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)
  const isUrgent = hoursUntilDue > 0 && hoursUntilDue < 24

  const actionLabel = (() => {
    switch (assessment.status) {
      case 'PENDING': return 'Start'
      case 'SUBMITTED': return assessment.canResubmit ? 'Resubmit' : 'View Submission'
      case 'GRADED': return 'View Submission'
      case 'OVERDUE': return assessment.canResubmit ? 'Submit Late' : 'View'
      default: return 'View'
    }
  })()

  return (
    <div className="rounded-xl border bg-card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <TypeBadge type={assessment.type} />
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full
            text-xs font-medium ${SUBMISSION_STATUS_COLORS[assessment.status] ?? 'bg-gray-100 text-gray-700'}`}
        >
          {assessment.status}
        </span>
      </div>

      <h3 className="font-medium text-sm leading-snug line-clamp-2">
        {assessment.title}
      </h3>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5 shrink-0" />
        <span className={isUrgent ? 'text-red-600 font-medium' : ''}>
          {isUrgent
            ? `Due in ${Math.max(1, Math.round(hoursUntilDue))}h`
            : dueDate.toLocaleDateString()}
        </span>
      </div>

      {assessment.status === 'GRADED' && assessment.score !== null && (
        <div className="text-sm font-medium">
          Score: {assessment.score}/{assessment.totalMarks}
          <span className="text-muted-foreground ml-1">
            ({Math.round((assessment.score / assessment.totalMarks) * 100)}%)
          </span>
        </div>
      )}

      <Button
        variant={assessment.status === 'PENDING' ? 'default' : 'outline'}
        size="sm"
        className="w-full min-h-[44px] mt-auto"
        asChild
      >
        <a href={`/management/subjects/${subjectId}/assessments/${assessment.id}`}>
          {actionLabel}
        </a>
      </Button>
    </div>
  )
}

// ─── Shared helpers ───

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    ASSIGNMENT: 'bg-violet-100 text-violet-700',
    QUIZ: 'bg-amber-100 text-amber-700',
    PEER: 'bg-teal-100 text-teal-700',
  }
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full
        text-xs font-medium ${colors[type] ?? 'bg-gray-100 text-gray-700'}`}
    >
      {type}
    </span>
  )
}

function DueDateCell({ date, status }: { date: string; status: string }) {
  const d = new Date(date)
  const isPast = status === 'PAST_DUE'
  return (
    <span className={`text-sm ${isPast ? 'text-red-600 font-medium' : ''}`}>
      {d.toLocaleDateString()}
    </span>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border bg-card p-16 flex flex-col
      items-center justify-center gap-3 text-center">
      <FileText className="h-10 w-10 text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
