'use client'

import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react'

interface Props {
  riskScore: number
  riskLevel: string
  attendancePct: number
  pendingFees: number
}

const LEVEL_CONFIG: Record<string, {
  bg: string; text: string; icon: typeof ShieldCheck
}> = {
  GREEN: { bg: 'bg-green-100', text: 'text-green-700', icon: ShieldCheck },
  AMBER: { bg: 'bg-amber-100', text: 'text-amber-700', icon: AlertTriangle },
  RED: { bg: 'bg-red-100', text: 'text-red-700', icon: ShieldAlert },
  CRITICAL: { bg: 'bg-red-200', text: 'text-red-800', icon: ShieldAlert },
}

export function StudentRiskCard({
  riskScore, riskLevel, attendancePct, pendingFees,
}: Props) {
  const cfg = LEVEL_CONFIG[riskLevel] ?? LEVEL_CONFIG.GREEN
  const Icon = cfg.icon

  const factors: string[] = []
  if (attendancePct < 75) factors.push('Attendance below 75%')
  if (pendingFees > 0) factors.push('Outstanding fee balance')

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <h3 className="text-sm font-semibold">Risk Assessment</h3>

      <div className="flex items-center gap-3">
        <div className={`h-12 w-12 rounded-full flex items-center
          justify-center ${cfg.bg} ${
          riskLevel === 'CRITICAL' ? 'animate-pulse' : ''
        }`}>
          <Icon className={`h-6 w-6 ${cfg.text}`} />
        </div>
        <div>
          <span className={`text-lg font-bold ${cfg.text}`}>
            {riskLevel}
          </span>
          <p className="text-xs text-muted-foreground">
            Score: {riskScore}/100
          </p>
        </div>
      </div>

      {factors.length > 0 ? (
        <ul className="space-y-1">
          {factors.map(f => (
            <li key={f} className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-red-400 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-green-600">
          All good — no concerns
        </p>
      )}
    </div>
  )
}
