'use client'

import { type MouseEvent } from 'react'
import { generateColor } from '@/lib/colors'
import type { AdmissionListItem } from './AdmissionsPipelineClient'

interface Props {
  admission: AdmissionListItem
  isOpened: boolean
  onOpen: (a: AdmissionListItem, e: MouseEvent) => void
}

export function AdmissionCard({ admission: a, isOpened, onOpen }: Props) {
  const initials = `${a.firstName[0]}${a.lastName[0]}`.toUpperCase()

  return (
    <div
      onClick={(e) => onOpen(a, e)}
      className={`block rounded-lg border bg-card p-3 hover:shadow-md
        transition-shadow cursor-pointer
        ${isOpened ? 'ring-1 ring-primary/40 bg-primary/5' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-full shrink-0 flex items-center
          justify-center text-gray-800 text-xs font-bold" style={{ backgroundColor: generateColor(a.firstName) }}>
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium truncate">
              {a.firstName} {a.lastName}
            </p>
            {isOpened && (
              <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">{a.applicationNo}</p>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2 flex-wrap">
        <span className="text-[10px] text-muted-foreground">
          {new Date(a.appliedAt).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short',
          })}
        </span>
        <span className={`inline-flex items-center px-1.5 py-0.5
          rounded text-[10px] font-medium
          ${a.admissionType === 'TRANSFER'
            ? 'bg-amber-100 text-amber-700'
            : 'bg-blue-100 text-blue-700'
          }`}>
          {a.admissionType}
        </span>
      </div>
    </div>
  )
}
