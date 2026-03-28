'use client'

import { useEffect, useState } from 'react'
import {
  AlertTriangle, TrendingDown, CreditCard,
  ShieldAlert, Package, CheckCircle2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface RiskSignal {
  type: string
  severity: 'critical' | 'warning' | 'info'
  title: string
  description: string
}

interface Props { institutionId: string; apiBase: string }

const SEVERITY_STYLES = {
  critical: {
    card: 'border-red-200 bg-red-50',
    icon: 'bg-red-100 text-red-600',
    badge: 'bg-red-100 text-red-700',
  },
  warning: {
    card: 'border-amber-200 bg-amber-50',
    icon: 'bg-amber-100 text-amber-600',
    badge: 'bg-amber-100 text-amber-700',
  },
  info: {
    card: 'border-blue-200 bg-blue-50',
    icon: 'bg-blue-100 text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
  },
}

const SIGNAL_ICONS: Record<string, LucideIcon> = {
  churn_risk: TrendingDown,
  payment_overdue: CreditCard,
  onboarding_stuck: AlertTriangle,
  login_attempts: ShieldAlert,
  low_adoption: Package,
  open_tickets: AlertTriangle,
}

export function RiskTab({ apiBase }: Props) {
  const [signals, setSignals] = useState<RiskSignal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${apiBase}/risk`, { signal: controller.signal })
      .then(r => r.json())
      .then(d => {
        setSignals((d as { signals: RiskSignal[] }).signals)
        setLoading(false)
      })
      .catch(err => {
        if (err instanceof Error && err.name === 'AbortError') return
        setError(true)
        setLoading(false)
      })
    return () => controller.abort()
  }, [apiBase])

  if (loading) return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i}
          className="h-20 rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  )

  if (error) return (
    <div className="rounded-xl border border-red-200 bg-red-50
      p-6 text-center text-red-700 text-sm">
      Failed to load risk data. Please refresh.
    </div>
  )

  if (signals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center
        py-20 gap-4">
        <div className="h-14 w-14 rounded-full bg-green-100 flex
          items-center justify-center">
          <CheckCircle2 className="h-7 w-7 text-green-600" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-lg text-green-700">
            No risk signals
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            This institution looks healthy.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {signals.length} risk signal
        {signals.length > 1 ? 's' : ''} detected
      </p>
      {signals.map((signal) => {
        const styles = SEVERITY_STYLES[signal.severity]
        const Icon = SIGNAL_ICONS[signal.type] ?? AlertTriangle
        return (
          <div key={`${signal.type}-${signal.severity}`}
            className={`rounded-xl border p-4 flex items-start
              gap-3 ${styles.card}`}>
            <div className={`h-9 w-9 rounded-full shrink-0 flex
              items-center justify-center ${styles.icon}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold">{signal.title}</p>
                <span className={`inline-flex items-center px-2 py-0.5
                  rounded-full text-xs font-medium capitalize
                  ${styles.badge}`}>
                  {signal.severity}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {signal.description}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
