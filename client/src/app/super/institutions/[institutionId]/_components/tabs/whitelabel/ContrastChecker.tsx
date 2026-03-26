'use client'

import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import type { ThemeValidation } from '@/lib/colorUtils'

interface Props {
  validation: ThemeValidation
}

export function ContrastChecker({ validation }: Props) {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">W3C Contrast Check</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            WCAG 2.1 accessibility compliance
          </p>
        </div>
        <div className={`flex items-center gap-1.5 text-xs
          font-medium px-2.5 py-1 rounded-full
          ${validation.allPass
            ? 'bg-green-100 text-green-700'
            : validation.score >= 60
              ? 'bg-amber-100 text-amber-700'
              : 'bg-red-100 text-red-700'
          }`}>
          {validation.allPass
            ? <CheckCircle2 className="h-3.5 w-3.5" />
            : <AlertCircle className="h-3.5 w-3.5" />
          }
          {validation.score}% passing
        </div>
      </div>

      {/* Score bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Accessibility score</span>
          <span>{validation.score}/100</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500
              ${validation.score === 100
                ? 'bg-green-500'
                : validation.score >= 60
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }`}
            style={{ width: `${validation.score}%` }}
          />
        </div>
      </div>

      {/* Individual checks */}
      <div className="space-y-0 divide-y">
        {validation.checks.map((check, i) => (
          <div key={i} className="flex items-center justify-between gap-3
            py-2.5">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {check.result.aa ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500 shrink-0" />
              )}
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="h-4 w-4 rounded border shrink-0"
                  style={{ backgroundColor: check.foreground }}
                />
                <span className="text-xs text-muted-foreground">on</span>
                <div
                  className="h-4 w-4 rounded border shrink-0"
                  style={{ backgroundColor: check.background }}
                />
                <span className="text-xs truncate">{check.label}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono text-muted-foreground">
                {check.result.ratio}:1
              </span>
              <span className={`inline-flex items-center px-2 py-0.5
                rounded-full text-xs font-medium
                ${check.result.aaa
                  ? 'bg-green-100 text-green-700'
                  : check.result.aa
                    ? 'bg-blue-100 text-blue-700'
                    : check.result.aaLarge
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                }`}>
                {check.result.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="border-t pt-3 grid grid-cols-2 gap-1.5">
        {[
          { label: 'AAA', desc: '7:1+ ratio', color: 'text-green-600' },
          { label: 'AA', desc: '4.5:1+', color: 'text-blue-600' },
          { label: 'AA Large', desc: '3:1+', color: 'text-amber-600' },
          { label: 'Fail', desc: 'Below 3:1', color: 'text-red-600' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className={`text-xs font-medium ${item.color}`}>
              {item.label}
            </span>
            <span className="text-xs text-muted-foreground">
              — {item.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
