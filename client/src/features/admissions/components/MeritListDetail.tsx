'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft, Trophy, Users, CalendarDays, Loader2, CheckCircle2, Clock,
} from 'lucide-react'
import { LIST_PAGE_CLASS, TABLE_CONTAINER_CLASS, TABLE_HEADER_CLASS } from '@/lib/table-constants'

interface MeritEntry {
  id: string
  rank: number
  score: number
  status: 'SELECTED' | 'WAITLISTED' | 'REJECTED'
  notifiedAt: string | null
  admission: {
    id: string
    applicationNo: string
    firstName: string
    lastName: string
  }
}

interface MeritConfigDetail {
  id: string
  name: string
  totalSeats: number
  cutoffScore: number | null
  rankingCriteria: Record<string, unknown>
  publishedAt: string | null
  createdAt: string
  targetClass: { id: string; name: string }
  academicYear: { id: string; name: string }
  entries: MeritEntry[]
}

function statusBadge(status: string) {
  switch (status) {
    case 'SELECTED':
      return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Selected</Badge>
    case 'WAITLISTED':
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Waitlisted</Badge>
    case 'REJECTED':
      return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function statusRowClass(status: string) {
  switch (status) {
    case 'SELECTED':
      return 'bg-emerald-50/50'
    case 'WAITLISTED':
      return 'bg-amber-50/50'
    case 'REJECTED':
      return 'bg-red-50/50'
    default:
      return ''
  }
}

export function MeritListDetail({ configId }: { configId: string }) {
  const { addParams } = useInstitutionId()
  const { toast } = useToast()

  const [config, setConfig] = useState<MeritConfigDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [publishing, setPublishing] = useState(false)

  const fetchConfig = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    addParams(params)
    fetch(`/api/school/merit-list/${configId}?${params}`)
      .then(r => r.json())
      .then((data: { config: MeritConfigDetail }) => setConfig(data.config ?? null))
      .catch(() => toast({ title: 'Failed to load merit list', variant: 'destructive' }))
      .finally(() => setLoading(false))
  }, [configId, addParams, toast])

  useEffect(() => { fetchConfig() }, [fetchConfig])

  const handleGenerate = async () => {
    if (!config) return
    setGenerating(true)
    try {
      const params = new URLSearchParams()
      addParams(params)
      const res = await fetch(`/api/school/merit-list/${configId}/generate?${params}`, {
        method: 'POST',
      })
      if (!res.ok) {
        const err = (await res.json()) as { error?: string }
        throw new Error(err.error ?? 'Failed to generate')
      }
      const result = (await res.json()) as {
        generated: number; selected: number; waitlisted: number; rejected: number
      }
      toast({
        title: 'Merit list generated',
        description: `${result.selected} selected, ${result.waitlisted} waitlisted, ${result.rejected} rejected`,
      })
      fetchConfig()
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setGenerating(false)
    }
  }

  const handlePublish = async () => {
    if (!config) return
    setPublishing(true)
    try {
      const params = new URLSearchParams()
      addParams(params)
      const res = await fetch(`/api/school/merit-list/${configId}/publish?${params}`, {
        method: 'POST',
      })
      if (!res.ok) {
        const err = (await res.json()) as { error?: string }
        throw new Error(err.error ?? 'Failed to publish')
      }
      toast({ title: 'Merit list published. Notifications sent.' })
      fetchConfig()
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setPublishing(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="rounded-xl border p-5 space-y-3">
          <div className="h-5 w-64 bg-muted animate-pulse rounded" />
          <div className="h-4 w-40 bg-muted animate-pulse rounded" />
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="rounded-xl border p-5 space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-10 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-lg font-semibold mb-1">Merit list not found</h2>
        <Link href="/management/admissions/merit-list"
          className="text-sm text-primary hover:underline mt-2">
          Back to merit lists
        </Link>
      </div>
    )
  }

  const hasEntries = config.entries.length > 0
  const isPublished = !!config.publishedAt
  const selectedCount = config.entries.filter(e => e.status === 'SELECTED').length
  const waitlistedCount = config.entries.filter(e => e.status === 'WAITLISTED').length
  const rejectedCount = config.entries.filter(e => e.status === 'REJECTED').length

  return (
    <div className={LIST_PAGE_CLASS} style={{ height: 'calc(100vh - 24px)' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/management/admissions/merit-list"
            className="inline-flex items-center justify-center rounded-md h-9 w-9
              hover:bg-muted transition-colors min-h-[44px] min-w-[44px]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{config.name}</h1>
            {isPublished && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                Published {new Date(config.publishedAt!).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isPublished && (
            <Button
              onClick={handleGenerate}
              disabled={generating}
              variant="outline"
              className="min-h-[44px]"
            >
              {generating ? (
                <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Generating...</>
              ) : (
                <><Trophy className="h-4 w-4 mr-1.5" />{hasEntries ? 'Regenerate' : 'Generate'}</>
              )}
            </Button>
          )}
          {hasEntries && !isPublished && (
            <Button
              onClick={handlePublish}
              disabled={publishing}
              className="min-h-[44px]"
            >
              {publishing ? (
                <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Publishing...</>
              ) : (
                'Publish'
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Config info card */}
      <div className="rounded-xl border p-4 sm:p-5 mt-4 shrink-0">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-start gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Academic Year</p>
              <p className="text-sm font-medium">{config.academicYear.name}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Class</p>
              <p className="text-sm font-medium">{config.targetClass.name}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Seats</p>
            <p className="text-sm font-medium">{config.totalSeats}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Cutoff Score</p>
            <p className="text-sm font-medium">
              {config.cutoffScore != null ? config.cutoffScore : 'N/A'}
            </p>
          </div>
        </div>

        {/* Summary badges when entries exist */}
        {hasEntries && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
            <span className="text-xs text-muted-foreground mr-1">Summary:</span>
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
              {selectedCount} Selected
            </Badge>
            <Badge className="bg-amber-100 text-amber-800 border-amber-200">
              {waitlistedCount} Waitlisted
            </Badge>
            {rejectedCount > 0 && (
              <Badge className="bg-red-100 text-red-800 border-red-200">
                {rejectedCount} Rejected
              </Badge>
            )}
            <span className="text-xs text-muted-foreground ml-auto">
              {config.entries.length} total entries
            </span>
          </div>
        )}
      </div>

      {/* Entries table */}
      {hasEntries ? (
        <div className={`${TABLE_CONTAINER_CLASS} mt-4`}>
          <table className="w-full text-sm">
            <thead className={TABLE_HEADER_CLASS}>
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground w-16">Rank</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                  Application No
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground w-20">Score</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground w-28">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {config.entries.map(entry => (
                <tr key={entry.id} className={statusRowClass(entry.status)}>
                  <td className="px-4 py-3 font-mono text-sm font-semibold">
                    #{entry.rank}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {entry.admission.firstName} {entry.admission.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground sm:hidden">
                      {entry.admission.applicationNo}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {entry.admission.applicationNo}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {entry.score.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    {statusBadge(entry.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center mt-4">
          <Clock className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <h3 className="text-sm font-semibold mb-1">No entries yet</h3>
          <p className="text-xs text-muted-foreground max-w-xs">
            Click &ldquo;Generate&rdquo; to rank all applied admissions for this class and year.
          </p>
        </div>
      )}
    </div>
  )
}
