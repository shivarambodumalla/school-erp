'use client'

import { useState, useEffect } from 'react'
import { Trophy } from 'lucide-react'
import { KudosBadgeIcon } from './KudosBadgeIcon'

interface LeaderboardEntry {
  studentId: string
  firstName: string
  lastName: string
  totalPoints: number
  badges: Record<string, number>
}

interface Props {
  classYearId?: string
}

export function KudosLeaderboard({ classYearId }: Props) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams()
    if (classYearId) params.set('classYearId', classYearId)
    params.set('take', '50')

    fetch(`/api/school/kudos?${params}`)
      .then(r => {
        if (!r.ok) throw new Error('Failed')
        return r.json()
      })
      .then((data: { kudos: Array<{ student: { id: string; firstName: string; lastName: string }; badgeType: string; points: number }> }) => {
        // Aggregate by student
        const map = new Map<string, LeaderboardEntry>()
        for (const k of data.kudos) {
          const existing = map.get(k.student.id)
          if (existing) {
            existing.totalPoints += k.points
            existing.badges[k.badgeType] = (existing.badges[k.badgeType] ?? 0) + 1
          } else {
            map.set(k.student.id, {
              studentId: k.student.id,
              firstName: k.student.firstName,
              lastName: k.student.lastName,
              totalPoints: k.points,
              badges: { [k.badgeType]: 1 },
            })
          }
        }
        const sorted = Array.from(map.values()).sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 5)
        setEntries(sorted)
      })
      .catch(() => setEntries([]))
      .finally(() => setLoading(false))
  }, [classYearId])

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-4 animate-pulse">
        <div className="h-5 w-32 bg-muted rounded mb-4" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-10 bg-muted rounded mb-2" />
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card">
      <div className="p-4 border-b flex items-center gap-2">
        <Trophy className="h-4 w-4 text-amber-500" />
        <h3 className="text-sm font-semibold">Kudos Leaderboard</h3>
      </div>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No kudos given yet</p>
      ) : (
        <div className="divide-y">
          {entries.map((entry, idx) => (
            <div key={entry.studentId} className="flex items-center gap-3 px-4 py-3">
              <span className={`text-sm font-bold w-6 text-center shrink-0 ${
                idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-700' : 'text-muted-foreground'
              }`}>
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {entry.firstName} {entry.lastName}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  {Object.entries(entry.badges).slice(0, 4).map(([badge, count]) => (
                    <div key={badge} className="flex items-center gap-0.5">
                      <KudosBadgeIcon badge={badge} size="sm" />
                      {count > 1 && <span className="text-[10px] text-muted-foreground">{count}</span>}
                    </div>
                  ))}
                </div>
              </div>
              <span className="text-sm font-semibold text-primary shrink-0">
                {entry.totalPoints} pts
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
