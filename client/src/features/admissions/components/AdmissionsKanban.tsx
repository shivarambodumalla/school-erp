'use client'

import { type MouseEvent } from 'react'
import Link from 'next/link'
import { ArrowRight, Phone, Plus, MessageSquarePlus } from 'lucide-react'
import { AdmissionCard } from './AdmissionCard'
import type { Inquiry, AdmissionListItem } from './AdmissionsPipelineClient'

const COLUMNS: { status: string; label: string; color: string }[] = [
  { status: 'APPLIED', label: 'Applied', color: 'border-blue-400' },
  { status: 'ADMITTED', label: 'Admitted', color: 'border-emerald-400' },
  { status: 'ENROLLED', label: 'Enrolled', color: 'border-violet-400' },
]

interface Props {
  admissions: AdmissionListItem[]
  inquiries: Inquiry[]
  openedIds: Set<string>
  onOpen: (a: AdmissionListItem, e: MouseEvent) => void
  onNewInquiry: () => void
}

export function AdmissionsKanban({ admissions, inquiries, openedIds, onOpen, onNewInquiry }: Props) {
  const grouped = COLUMNS.map(col => ({
    ...col,
    items: admissions.filter(a => a.status === col.status),
  }))

  const unconverted = inquiries.filter(i => !i.convertedToAdmissionId)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Inquiry column */}
      <div className="rounded-xl border-t-2 border-amber-400 bg-muted/30 p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Inquiry</h3>
            <span className="text-xs text-muted-foreground bg-muted
              px-1.5 py-0.5 rounded-full">
              {unconverted.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onNewInquiry}
            className="p-1 rounded hover:bg-muted transition-colors"
            title="New Inquiry"
          >
            <MessageSquarePlus className="h-4 w-4 text-amber-600" />
          </button>
        </div>

        <div className="space-y-2">
          {unconverted.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">
              No inquiries
            </p>
          ) : (
            unconverted.map(inq => (
              <InquiryCard key={inq.id} inquiry={inq} />
            ))
          )}
        </div>
      </div>

      {/* Admission columns */}
      {grouped.map(col => (
        <div key={col.status} className={`rounded-xl border-t-2 ${col.color}
          bg-muted/30 p-3 space-y-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">{col.label}</h3>
              <span className="text-xs text-muted-foreground bg-muted
                px-1.5 py-0.5 rounded-full">
                {col.items.length}
              </span>
            </div>
            {col.status === 'APPLIED' && (
              <Link
                href="/management/admissions/new"
                className="p-1 rounded hover:bg-muted transition-colors"
                title="New Application"
              >
                <Plus className="h-4 w-4 text-blue-500" />
              </Link>
            )}
          </div>

          <div className="space-y-2">
            {col.items.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                No applications
              </p>
            ) : (
              col.items.map(a => (
                <AdmissionCard key={a.id} admission={a}
                  isOpened={openedIds.has(a.id)} onOpen={onOpen} />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function InquiryCard({ inquiry: inq }: { inquiry: Inquiry }) {
  const params = new URLSearchParams({
    inquiryId: inq.id,
    name: inq.name,
    phone: inq.phone,
  })
  if (inq.email) params.set('email', inq.email)

  return (
    <div className="group rounded-lg border bg-card p-3 space-y-2">
      <div>
        <p className="text-sm font-medium truncate">{inq.name}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
          <Phone className="h-3 w-3" />
          {inq.phone}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] text-muted-foreground">
          {new Date(inq.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short',
          })}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
          {inq.source.replace('_', '-')}
        </span>
      </div>
      <Link
        href={`/management/admissions/new?${params}`}
        className="flex items-center gap-1 text-xs font-medium text-primary
          hover:underline pt-1 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        Convert to Application <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  )
}
