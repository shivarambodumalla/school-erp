'use client'

import { useState, useEffect } from 'react'
import { Phone, ChevronRight, BookOpen } from 'lucide-react'
import { StudentOverviewStats } from './StudentOverviewStats'
import { StudentTodayTimetable } from './StudentTodayTimetable'
import { StudentRiskCard } from './StudentRiskCard'

interface Guardian {
  id: string; type: string; name: string; phone: string
  email: string | null; isPrimaryContact: boolean; isEmergencyContact: boolean
}

interface OverviewData {
  attendance: { present: number; absent: number; late: number; total: number; pct: number }
  fees: { pendingAmount: number; paidAmount: number; lastPaymentDate: string | null }
  courses: Array<{ title: string; progressPercent: number; completedAt: string | null }>
  grades: Array<{ subjectName: string; marksObtained: number; totalMarks: number; gradeLetter: string }>
  todaySlots: Array<{
    periodNumber: number; startTime: string; endTime: string
    subject: { name: string }; staff: { firstName: string; lastName: string }
  }>
  riskScore: number
  riskLevel: string
  guardians: Guardian[]
}

interface Props {
  studentId: string
  onSwitchTab?: (tab: string) => void
}

export function StudentOverviewTab({ studentId, onSwitchTab }: Props) {
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/school/students/${studentId}/overview`)
      .then(r => { if (!r.ok) throw new Error('Failed to load'); return r.json() })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [studentId])

  if (loading) return <OverviewSkeleton />
  if (error) return <div className="text-center py-12 text-red-500 text-sm">{error}</div>
  if (!data) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <StudentOverviewStats
          attendance={data.attendance}
          fees={data.fees}
          coursesCount={data.courses.length}
          riskLevel={data.riskLevel}
          riskScore={data.riskScore}
        />
        <StudentTodayTimetable slots={data.todaySlots} />
        <RecentGrades grades={data.grades} />
      </div>

      <div className="space-y-4">
        <GuardianContacts guardians={data.guardians} onSwitchTab={onSwitchTab} />
        <ActiveCourses courses={data.courses} />
        <StudentRiskCard
          riskScore={data.riskScore}
          riskLevel={data.riskLevel}
          attendancePct={data.attendance.pct}
          pendingFees={data.fees.pendingAmount}
        />
      </div>
    </div>
  )
}

/* Sub-sections kept inline — each < 50 lines */

const GRADE_COLORS: Record<string, string> = {
  'A+': 'bg-green-100 text-green-700', A: 'bg-blue-100 text-blue-700',
  'B+': 'bg-indigo-100 text-indigo-700', B: 'bg-amber-100 text-amber-700',
  C: 'bg-orange-100 text-orange-700', F: 'bg-red-100 text-red-700',
}

function RecentGrades({ grades }: { grades: OverviewData['grades'] }) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="p-4 border-b"><h3 className="text-sm font-semibold">Recent Results</h3></div>
      {grades.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No exam results yet</p>
      ) : (
        <div className="divide-y">
          {grades.map((g, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-medium">{g.subjectName}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{g.marksObtained}/{g.totalMarks}</span>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${GRADE_COLORS[g.gradeLetter] ?? 'bg-muted'}`}>
                  {g.gradeLetter}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function GuardianContacts({ guardians, onSwitchTab }: {
  guardians: Guardian[]; onSwitchTab?: (tab: string) => void
}) {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <h3 className="text-sm font-semibold">Emergency Contacts</h3>
      {guardians.length === 0 ? (
        <p className="text-sm text-muted-foreground">No contacts added</p>
      ) : (
        guardians.map(g => (
          <div key={g.id}>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted">{g.type}</span>
              <span className="text-sm font-medium">{g.name}</span>
            </div>
            <a href={`tel:${g.phone}`} className="flex items-center gap-1 text-xs text-primary mt-0.5 min-h-[44px]">
              <Phone className="h-3 w-3" /> {g.phone}
            </a>
          </div>
        ))
      )}
      {onSwitchTab && (
        <button onClick={() => onSwitchTab('guardians')}
          className="flex items-center gap-1 text-xs text-primary font-medium hover:underline min-h-[44px]">
          View all guardians <ChevronRight className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

function ActiveCourses({ courses }: { courses: OverviewData['courses'] }) {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <h3 className="text-sm font-semibold">Active Courses</h3>
      {courses.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-4 text-muted-foreground">
          <BookOpen className="h-6 w-6" /><p className="text-xs">Not enrolled in any courses</p>
        </div>
      ) : (
        courses.map((c, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium truncate">{c.title}</span>
              <span className="text-xs text-muted-foreground shrink-0">{c.progressPercent}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${c.progressPercent}%` }} />
            </div>
          </div>
        ))
      )}
    </div>
  )
}

function OverviewSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-pulse">
      <div className="lg:col-span-2 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 rounded-xl bg-muted" />)}
        </div>
        <div className="h-48 rounded-xl bg-muted" />
        <div className="h-36 rounded-xl bg-muted" />
      </div>
      <div className="space-y-4">
        <div className="h-40 rounded-xl bg-muted" />
        <div className="h-32 rounded-xl bg-muted" />
        <div className="h-36 rounded-xl bg-muted" />
      </div>
    </div>
  )
}
