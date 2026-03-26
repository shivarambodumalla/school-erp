'use client'

import { useEffect, useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { AUDIT_ACTION_COLORS } from '@/lib/colors'

interface LogRow {
  id: string
  action: string
  tableName: string
  recordId: string
  createdAt: string
  before: unknown
  after: unknown
  userEmail: string
}

interface Props { institutionId: string; apiBase: string }

export function AuditTab({ institutionId, apiBase }: Props) {
  const [logs, setLogs] = useState<LogRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${apiBase}/audit`, { signal: controller.signal })
      .then(r => r.json())
      .then(d => {
        setLogs((d as { logs: LogRow[] }).logs)
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
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i}
          className="h-14 rounded-lg bg-muted animate-pulse" />
      ))}
    </div>
  )

  if (error) return (
    <div className="rounded-xl border border-red-200 bg-red-50
      p-6 text-center text-red-700 text-sm">
      Failed to load audit data. Please refresh.
    </div>
  )

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center
        py-16 gap-3">
        <ClipboardList className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">No audit log entries yet</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card divide-y">
      {logs.map(log => (
        <div
          key={log.id}
          role="button"
          tabIndex={0}
          aria-expanded={expanded === log.id}
          className="px-4 py-3 cursor-pointer hover:bg-muted/20
            transition-colors"
          onClick={() =>
            setExpanded(expanded === log.id ? null : log.id)
          }
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setExpanded(expanded === log.id ? null : log.id)
            }
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className={`inline-flex items-center px-2 py-0.5
                rounded-full text-xs font-medium shrink-0
                ${AUDIT_ACTION_COLORS[log.action] ??
                  'bg-gray-100 text-gray-600'}`}>
                {log.action}
              </span>
              <span className="text-sm text-muted-foreground truncate">
                {log.tableName} · {log.recordId.slice(0, 8)}...
              </span>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-medium">
                {log.userEmail}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(log.createdAt).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          {expanded === log.id && (log.before != null || log.after != null) && (
            <div className="mt-3 space-y-2">
              {log.before != null && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Before</p>
                  <pre className="text-xs bg-muted rounded-lg p-3
                    overflow-x-auto">
                    {String(JSON.stringify(log.before, null, 2))}
                  </pre>
                </div>
              )}
              {log.after != null && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">After</p>
                  <pre className="text-xs bg-muted rounded-lg p-3
                    overflow-x-auto">
                    {String(JSON.stringify(log.after, null, 2))}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
