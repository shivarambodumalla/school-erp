'use client'

import Link from 'next/link'
import { LayoutGrid, Users, ArrowRight } from 'lucide-react'
import { generateColor, CLASS_STATUS_COLORS } from '@/lib/colors'
import type { ClassTemplate } from '../types'

interface ClassCardProps {
  data: ClassTemplate
}

export function ClassCard({ data }: ClassCardProps) {
  const { name, gradeLevel, activeYear } = data
  const status = activeYear?.status ?? 'DRAFT'
  const statusClass = CLASS_STATUS_COLORS[status] ?? CLASS_STATUS_COLORS.DRAFT

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4
      hover:shadow-md transition-shadow">
      {/* Top row: grade badge + status */}
      <div className="flex items-start justify-between">
        <div className="h-12 w-12 rounded-lg flex items-center justify-center text-lg font-bold text-gray-800 shrink-0"
          style={{ backgroundColor: generateColor(name) }}>
          {gradeLevel}
        </div>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full
          text-xs font-medium ${statusClass}`}>
          {status}
        </span>
      </div>

      {/* Class name */}
      <p className="font-bold text-lg leading-tight">{name}</p>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <LayoutGrid className="h-3.5 w-3.5" />
          {activeYear?.sectionCount ?? 0} sections
        </span>
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {activeYear?.studentCount ?? 0} students
        </span>
      </div>

      {/* Manage link */}
      {activeYear ? (
        <Link
          href={`/management/institution/classes/${activeYear.serialNo}`}
          className="inline-flex items-center gap-1 text-sm font-medium
            text-primary hover:underline min-h-[44px]"
        >
          Manage <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      ) : (
        <p className="text-xs text-muted-foreground">
          No active year linked
        </p>
      )}
    </div>
  )
}
