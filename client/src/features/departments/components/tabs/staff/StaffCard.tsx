'use client'

import Link from 'next/link'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface StaffMember {
  id: string; firstName: string; lastName: string; designation: string; serialNo?: string
  primaryRole: { name: string } | null
  reportsTo: { firstName: string; lastName: string } | null
}

interface Props {
  staff: StaffMember
  isHod: boolean
  isAdmin: boolean
  onRemove: (id: string) => void
}

export function StaffCard({ staff, isHod, isAdmin, onRemove }: Props) {
  return (
    <div className={`rounded-xl border p-4 flex items-start gap-3 relative ${isHod ? 'border-primary col-span-full' : ''}`}>
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold shrink-0">
        {staff.firstName[0]}{staff.lastName[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{staff.firstName} {staff.lastName}</p>
        <p className="text-xs text-muted-foreground truncate">{staff.designation}</p>
        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          {isHod && <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">HOD</Badge>}
          {staff.primaryRole && (
            <Badge variant="secondary" className="text-xs">{staff.primaryRole.name}</Badge>
          )}
        </div>
        {staff.reportsTo && (
          <p className="text-xs text-muted-foreground mt-1">
            Reports to: {staff.reportsTo.firstName} {staff.reportsTo.lastName}
          </p>
        )}
        <Link href={`/management/staff/${staff.id}`}
          className="text-xs text-primary hover:underline mt-1 inline-block">
          View Profile
        </Link>
      </div>
      {isAdmin && !isHod && (
        <button type="button" onClick={() => onRemove(staff.id)}
          className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-destructive min-h-[44px] min-w-[44px] absolute top-2 right-2"
          aria-label="Remove from department">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
