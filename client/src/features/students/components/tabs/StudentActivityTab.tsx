'use client'

import { useState, useEffect, useCallback } from 'react'
import { AchievementsSection } from './ActivityAchievements'
import { IncidentsSection } from './ActivityIncidents'
import { CounsellorNotesSection } from './ActivityCounsellorNotes'

interface Incident {
  id: string; type: string; date: string; description: string
  actionTaken: string | null; severity: string
  parentNotified: boolean; createdAt: string
}

interface AchievementItem {
  id: string; category: string; title: string
  description: string | null; date: string
  photoUrl: string | null; createdAt: string
}

interface CounsellorNoteItem {
  id: string; note: string; followUpDate: string | null; createdAt: string
}

interface ActivityData {
  incidents: Incident[]
  achievements: AchievementItem[]
  counsellorNotes: CounsellorNoteItem[]
}

interface Props {
  studentId: string
  portalType: string
}

export function StudentActivityTab({ studentId, portalType }: Props) {
  const [data, setData] = useState<ActivityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = useCallback(() => {
    fetch(`/api/school/students/${studentId}/activity`)
      .then(r => { if (!r.ok) throw new Error('Failed to load'); return r.json() })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [studentId])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) return <ActivitySkeleton />
  if (error) return <div className="text-center py-12 text-red-500 text-sm">{error}</div>
  if (!data) return null

  const isAdmin = portalType === 'ADMIN'

  return (
    <div className="space-y-6">
      <AchievementsSection
        achievements={data.achievements}
        studentId={studentId}
        isAdmin={isAdmin}
        onRefresh={fetchData}
      />
      <IncidentsSection
        incidents={data.incidents}
        studentId={studentId}
        isAdmin={isAdmin}
        onRefresh={fetchData}
      />
      {isAdmin && (
        <CounsellorNotesSection
          notes={data.counsellorNotes}
          studentId={studentId}
          onRefresh={fetchData}
        />
      )}
    </div>
  )
}

function ActivitySkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="space-y-3">
          <div className="h-5 w-32 bg-muted rounded" />
          <div className="h-24 bg-muted rounded-xl" />
        </div>
      ))}
    </div>
  )
}
