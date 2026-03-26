'use client'

import { CheckCircle2, Circle } from 'lucide-react'
import Link from 'next/link'
import type { OnboardingStatus } from './types'

interface Props {
  onboarding: OnboardingStatus | null
  institutionId: string
}

const STEPS = [
  { key: 'classesAdded' as const, label: 'Classes added' },
  { key: 'staffAdded' as const, label: 'Staff added' },
  { key: 'studentsAdded' as const, label: 'Students added' },
]

export function OnboardingChecklist({ onboarding, institutionId }: Props) {
  if (!onboarding) {
    return (
      <div className="rounded-xl border bg-card p-4">
        <h3 className="font-semibold text-sm mb-3">Onboarding</h3>
        <p className="text-xs text-muted-foreground">
          Onboarding not started yet.
        </p>
      </div>
    )
  }

  if (onboarding.completedAt) {
    return (
      <div className="rounded-xl border bg-card p-4">
        <h3 className="font-semibold text-sm mb-3">Onboarding</h3>
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm font-medium">Setup complete</span>
        </div>
      </div>
    )
  }

  const completed = STEPS.filter(s => onboarding[s.key]).length
  const pct = Math.round((completed / STEPS.length) * 100)

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Onboarding</h3>
        <span className="text-xs text-muted-foreground">
          {completed}/{STEPS.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-muted mb-4">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="space-y-2.5">
        {STEPS.map(step => {
          const done = onboarding[step.key]
          return (
            <div key={step.key} className="flex items-center gap-2.5">
              {done ? (
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <span
                className={`text-sm ${
                  done
                    ? 'text-foreground line-through'
                    : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      {completed < STEPS.length && (
        <Link
          href={`/super/institutions/${institutionId}?tab=people`}
          className="block text-xs text-primary hover:underline mt-3"
        >
          Help this school complete setup &rarr;
        </Link>
      )}
    </div>
  )
}
