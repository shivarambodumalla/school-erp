'use client'

import { type MouseEvent } from 'react'
import type { AdmissionListItem } from './AdmissionsPipelineClient'

const STATUS_STYLES: Record<string, string> = {
  APPLIED: 'bg-blue-100 text-blue-700',
  ADMITTED: 'bg-emerald-100 text-emerald-700',
  ENROLLED: 'bg-violet-100 text-violet-700',
  REJECTED: 'bg-red-100 text-red-700',
}

interface Props {
  admissions: AdmissionListItem[]
  statusFilter: string
  onStatusFilter: (s: string) => void
  openedIds: Set<string>
  onOpen: (a: AdmissionListItem, e: MouseEvent) => void
}

const FILTERS = ['ALL', 'APPLIED', 'ADMITTED', 'ENROLLED', 'REJECTED']

export function AdmissionsTable({ admissions, statusFilter, onStatusFilter, openedIds, onOpen }: Props) {
  const filtered = statusFilter === 'ALL'
    ? admissions
    : admissions.filter(a => a.status === statusFilter)

  return (
    <div className="space-y-3">
      {/* Status filter pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => onStatusFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
              ${statusFilter === f
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">App No</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Adm No</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Applied</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-muted-foreground">
                  No admissions found
                </td>
              </tr>
            ) : (
              filtered.map(a => {
                const isOpened = openedIds.has(a.id)
                return (
                  <tr key={a.id}
                    onClick={(e) => onOpen(a, e)}
                    className={`border-b last:border-0 cursor-pointer transition-colors
                      ${isOpened ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/50'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{a.firstName} {a.lastName}</span>
                        {isOpened && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {a.applicationNo}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {a.admissionNo ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5
                        rounded-full text-xs font-medium ${STATUS_STYLES[a.status] ?? ''}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                      {new Date(a.appliedAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
