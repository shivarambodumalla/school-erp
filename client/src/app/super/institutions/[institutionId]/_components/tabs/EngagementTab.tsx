'use client'

import { BarChart3 } from 'lucide-react'

export function EngagementTab({
  institutionId: _,
  apiBase: _apiBase,
}: {
  institutionId: string
  apiBase: string
}) {
  return (
    <div className="flex flex-col items-center justify-center
      py-20 gap-4">
      <div className="h-14 w-14 rounded-full bg-muted flex
        items-center justify-center">
        <BarChart3 className="h-7 w-7 text-muted-foreground" />
      </div>
      <div className="text-center">
        <p className="font-semibold text-lg">Engagement Analytics</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Usage tracking, login frequency, and feature adoption
          metrics will be available once activity logging
          is fully set up.
        </p>
      </div>
      <span className="inline-flex items-center px-3 py-1.5
        rounded-full text-xs font-medium bg-amber-100 text-amber-700">
        Coming in Phase 5
      </span>
    </div>
  )
}
