'use client'

import { AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatHodSince } from '../../types'

interface Hod {
  id: string; firstName: string; lastName: string; designation: string
  user?: { email: string } | null
}

interface Props {
  department: {
    color: string; hodId: string | null; hodSince: string | null
    hod: Hod | null
    deputyHod: { id: string; firstName: string; lastName: string; designation: string } | null
  }
}

export function DeptHeroCards({ department: dept }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {dept.hod ? (
        <div className="rounded-xl border p-4 space-y-2">
          <Badge variant="secondary" className="text-xs">Head of Department</Badge>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ backgroundColor: dept.color }}>
              {dept.hod.firstName[0]}{dept.hod.lastName[0]}
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">{dept.hod.firstName} {dept.hod.lastName}</p>
              <p className="text-xs text-muted-foreground truncate">{dept.hod.designation}</p>
            </div>
          </div>
          {dept.hodSince && (
            <p className="text-xs text-muted-foreground">Since {formatHodSince(dept.hodSince)}</p>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">No HOD assigned</p>
            <p className="text-xs text-amber-600">This department needs a head</p>
          </div>
          <Button variant="outline" size="sm" className="min-h-[44px] border-amber-300 text-amber-700 hover:bg-amber-100">
            Assign HOD
          </Button>
        </div>
      )}

      {dept.deputyHod ? (
        <div className="rounded-xl border p-4 space-y-2">
          <Badge variant="secondary" className="text-xs">Deputy HOD</Badge>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ backgroundColor: dept.color }}>
              {dept.deputyHod.firstName[0]}{dept.deputyHod.lastName[0]}
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">{dept.deputyHod.firstName} {dept.deputyHod.lastName}</p>
              <p className="text-xs text-muted-foreground truncate">{dept.deputyHod.designation}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-4 flex items-center justify-center text-sm text-muted-foreground">
          No Deputy HOD assigned
        </div>
      )}
    </div>
  )
}
