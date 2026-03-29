'use client'

import { useEffect, useState } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { StudentHero } from './StudentHero'
import { StudentTabs } from './StudentTabs'
import type { StudentProfile } from '../types'

interface Props {
  studentId: string
}

export function StudentDetailInline({ studentId }: Props) {
  const { apiParam } = useInstitutionId()
  const [student, setStudent] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    setEditMode(false)
    fetch(`/api/school/students/${studentId}${apiParam}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found')
        return r.json()
      })
      .then(d => { setStudent(d as StudentProfile); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [studentId, apiParam])

  if (loading) {
    return (
      <div className="space-y-6 pt-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-xl bg-muted animate-pulse shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-48 rounded bg-muted animate-pulse" />
            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div className="h-64 rounded-xl bg-muted animate-pulse" />
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 text-sm mt-4">
        Failed to load student profile. Please try again.
      </div>
    )
  }

  function handleSaved(updated: StudentProfile) {
    setStudent(updated)
    setEditMode(false)
  }

  return (
    <div className="space-y-6 pt-2">
      <StudentHero
        student={student}
        editMode={editMode}
        onEditToggle={() => setEditMode(!editMode)}
      />
      <StudentTabs
        student={student}
        portalType="ADMIN"
        onStudentUpdated={handleSaved}
      />
    </div>
  )
}
