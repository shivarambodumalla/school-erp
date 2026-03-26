'use client'

import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import type { RiskSignal } from './types'

interface Props {
  signals: RiskSignal[]
  institutionId: string
}

export function RiskSummary({ signals, institutionId }: Props) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Risk Signals</h3>
        {signals.length > 0 && (
          <Link
            href={`/super/institutions/${institutionId}?tab=risk`}
            className="text-xs text-primary hover:underline"
          >
            View all
          </Link>
        )}
      </div>

      {signals.length === 0 ? (
        <div className="flex items-center gap-2 text-green-600 py-2">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm font-medium">All clear</span>
        </div>
      ) : (
        <div className="space-y-2">
          {signals.map((signal, i) => (
            <div
              key={i}
              className={`flex items-center gap-2.5 rounded-lg p-2.5
                text-sm font-medium
                ${signal.severity === 'critical'
                  ? 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200'
                  : 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                }`}
            >
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {signal.title}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
