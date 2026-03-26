'use client'

import {
  Building2, BookOpen, MapPin, Phone,
  Globe, Calendar,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { InstitutionDetails } from './types'

interface Props {
  institution: InstitutionDetails
}

interface DetailRowProps {
  icon: React.ElementType
  label: string
  value: string
}

function DetailRow({ icon: Icon, label, value }: DetailRowProps) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  )
}

export function SchoolDetailsCard({ institution }: Props) {
  const memberSince = formatDistanceToNow(
    new Date(institution.createdAt),
    { addSuffix: true }
  )

  const location = [institution.city, institution.state]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="rounded-xl border bg-card p-4">
      <h3 className="font-semibold text-sm mb-3">School Details</h3>

      <div className="divide-y">
        <DetailRow
          icon={Building2}
          label="Type"
          value={institution.institutionType.replace('_', ' ')}
        />
        <DetailRow
          icon={BookOpen}
          label="Board"
          value={institution.board}
        />
        {location && (
          <DetailRow
            icon={MapPin}
            label="Location"
            value={location}
          />
        )}
        {institution.phone && (
          <DetailRow
            icon={Phone}
            label="Phone"
            value={institution.phone}
          />
        )}
        {institution.website && (
          <DetailRow
            icon={Globe}
            label="Website"
            value={institution.website}
          />
        )}
        <DetailRow
          icon={Calendar}
          label="Member Since"
          value={memberSince}
        />
      </div>
    </div>
  )
}
