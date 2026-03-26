'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { OverviewData } from './overview/types'
import { OverviewStatsRow } from './overview/OverviewStats'
import { UserBreakdownChart } from './overview/UserBreakdownChart'
import { LoginActivityChart } from './overview/LoginActivityChart'
import { OnboardingChecklist } from './overview/OnboardingChecklist'
import { RiskSummary } from './overview/RiskSummary'
import { QuickLinks } from './overview/QuickLinks'
import { SchoolDetailsCard } from './overview/SchoolDetailsCard'

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-52 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

interface Props {
  institutionId: string
  apiBase: string
  isSchoolAdmin?: boolean
}

export function OverviewTab({ institutionId, apiBase, isSchoolAdmin }: Props) {
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${apiBase}/overview`, { signal: controller.signal })
      .then(r => {
        if (!r.ok) throw new Error('Failed')
        return r.json()
      })
      .then(setData)
      .catch(err => {
        if (err instanceof Error && err.name === 'AbortError') return
        setError(true)
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [apiBase])

  if (loading) return <OverviewSkeleton />

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <p className="text-sm text-muted-foreground">
          Failed to load overview data.
        </p>
        <button
          onClick={() => {
            setError(false)
            setLoading(true)
            fetch(`${apiBase}/overview`)
              .then(r => {
                if (!r.ok) throw new Error('Failed')
                return r.json()
              })
              .then(setData)
              .catch(() => setError(true))
              .finally(() => setLoading(false))
          }}
          className="text-sm text-primary hover:underline"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <OverviewStatsRow stats={data.stats} institution={data.institution} />

      {/* Main grid: 2/3 left + 1/3 right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          <LoginActivityChart
            data={data.loginActivity}
            primaryColor={data.institution.primaryColor}
          />
          <UserBreakdownChart data={data.userBreakdown} />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <OnboardingChecklist
            onboarding={data.onboarding}
            institutionId={institutionId}
          />
          <RiskSummary
            signals={data.riskSignals}
            institutionId={institutionId}
          />
          <QuickLinks
            institutionId={institutionId}
            subdomain={data.institution.subdomain}
            isSchoolAdmin={isSchoolAdmin}
          />
          <SchoolDetailsCard institution={data.institution} />
        </div>
      </div>
    </div>
  )
}
