'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { KudosBadgeIcon, ALL_BADGES, getBadgeLabel } from '@/features/kudos/components/KudosBadgeIcon'
import { GiveKudosSheet } from '@/features/kudos/components/GiveKudosSheet'

interface KudosItem {
  id: string
  badgeType: string
  title: string
  description: string | null
  points: number
  createdAt: string
  teacher: { id: string; firstName: string; lastName: string }
}

interface KudosData {
  kudos: KudosItem[]
  totalPoints: number
  badgeCounts: Record<string, number>
}

interface Props {
  studentId: string
  studentName: string
}

export function StudentKudosTab({ studentId, studentName }: Props) {
  const [data, setData] = useState<KudosData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sheetOpen, setSheetOpen] = useState(false)

  const fetchData = useCallback(() => {
    setLoading(true)
    fetch(`/api/school/students/${studentId}/kudos`)
      .then(r => { if (!r.ok) throw new Error('Failed to load'); return r.json() })
      .then((d: KudosData) => setData(d))
      .catch(e => setError(e instanceof Error ? e.message : 'Unknown error'))
      .finally(() => setLoading(false))
  }, [studentId])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) return <KudosSkeleton />
  if (error) return <div className="text-center py-12 text-red-500 text-sm">{error}</div>
  if (!data) return null

  return (
    <div className="space-y-5">
      {/* Header with total points + Give Kudos button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
            <Award className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{data.totalPoints}</p>
            <p className="text-xs text-muted-foreground">Total Points</p>
          </div>
        </div>
        <Button onClick={() => setSheetOpen(true)} className="min-h-[44px] gap-2">
          <Plus className="h-4 w-4" />
          Give Kudos
        </Button>
      </div>

      {/* Badge collection */}
      <div className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-semibold mb-3">Badge Collection</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {ALL_BADGES.map(badge => {
            const count = data.badgeCounts[badge] ?? 0
            return (
              <div
                key={badge}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl
                  ${count > 0 ? 'bg-muted/50' : 'bg-muted/20 opacity-40'}`}
              >
                <KudosBadgeIcon badge={badge} size="md" />
                <span className="text-[10px] font-medium text-muted-foreground">
                  {getBadgeLabel(badge)}
                </span>
                <span className={`text-xs font-bold ${count > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Kudos history */}
      <div className="rounded-xl border bg-card">
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold">Kudos History</h3>
        </div>
        {data.kudos.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No kudos received yet
          </p>
        ) : (
          <div className="divide-y">
            {data.kudos.map(k => (
              <div key={k.id} className="flex items-start gap-3 px-4 py-3">
                <KudosBadgeIcon badge={k.badgeType} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{k.title}</span>
                    <span className="text-xs font-semibold text-primary">+{k.points} pts</span>
                  </div>
                  {k.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{k.description}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    By {k.teacher.firstName} {k.teacher.lastName}
                    {' \u00B7 '}
                    {new Date(k.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <GiveKudosSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        studentId={studentId}
        studentName={studentName}
        onSuccess={fetchData}
      />
    </div>
  )
}

function KudosSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-muted" />
        <div className="space-y-2">
          <div className="h-6 w-16 bg-muted rounded" />
          <div className="h-3 w-20 bg-muted rounded" />
        </div>
      </div>
      <div className="h-32 bg-muted rounded-xl" />
      <div className="h-48 bg-muted rounded-xl" />
    </div>
  )
}
