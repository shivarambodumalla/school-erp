'use client'

import { useState, useEffect, useCallback } from 'react'
import { StudentAcademicsAttendance } from './StudentAcademicsAttendance'
import { StudentMarksheet } from './StudentMarksheet'
import { StudentAcademicsCourses } from './StudentAcademicsCourses'

interface AcademicsData {
  academicYears: Array<{ id: string; name: string }>
  selectedYear: { id: string; name: string } | null
  classInfo: { className: string; sectionName: string }
  attendance: {
    present: number; absent: number; late: number
    halfDay: number; excused: number; total: number; pct: number
  }
  gradesByExam: Array<{
    examType: string
    grades: Array<{
      subjectName: string; maxMarks: number
      obtained: number; percentage: number; grade: string
    }>
    totalObtained: number; totalMax: number
    avgPct: number; overallGrade: string
  }>
  courses: Array<{
    title: string; subject?: string
    progressPercent: number; completedAt: string | null
  }>
}

interface Props {
  studentId: string
}

export function StudentAcademicsTab({ studentId }: Props) {
  const [data, setData] = useState<AcademicsData | null>(null)
  const [yearId, setYearId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = useCallback((selectedYearId?: string) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (selectedYearId) params.set('academicYearId', selectedYearId)

    fetch(`/api/school/students/${studentId}/academics?${params}`)
      .then(r => { if (!r.ok) throw new Error('Failed to load'); return r.json() })
      .then((d: AcademicsData) => {
        setData(d)
        if (!selectedYearId && d.selectedYear) setYearId(d.selectedYear.id)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [studentId])

  useEffect(() => { fetchData() }, [fetchData])

  function handleYearChange(id: string) {
    setYearId(id)
    fetchData(id)
  }

  if (loading && !data) return <AcademicsSkeleton />
  if (error) return <div className="text-center py-12 text-red-500 text-sm">{error}</div>
  if (!data) return null

  return (
    <div className="space-y-5">
      {/* Year selector + header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">
            {data.classInfo.className} | Section {data.classInfo.sectionName}
          </h3>
          {data.selectedYear && (
            <p className="text-sm text-muted-foreground">
              Academic Year {data.selectedYear.name}
            </p>
          )}
        </div>
        {data.academicYears.length > 1 && (
          <select
            value={yearId ?? ''}
            onChange={e => handleYearChange(e.target.value)}
            className="h-11 rounded-md border border-input bg-background
              px-3 text-sm min-w-[180px]"
          >
            {data.academicYears.map(y => (
              <option key={y.id} value={y.id}>{y.name}</option>
            ))}
          </select>
        )}
      </div>

      <StudentAcademicsAttendance attendance={data.attendance} />
      <StudentMarksheet gradesByExam={data.gradesByExam} />
      <StudentAcademicsCourses courses={data.courses} />
    </div>
  )
}

function AcademicsSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-5 w-40 bg-muted rounded" />
          <div className="h-4 w-28 bg-muted rounded" />
        </div>
        <div className="h-11 w-44 bg-muted rounded-md" />
      </div>
      <div className="h-44 rounded-xl bg-muted" />
      <div className="h-48 rounded-xl bg-muted" />
      <div className="h-36 rounded-xl bg-muted" />
    </div>
  )
}
