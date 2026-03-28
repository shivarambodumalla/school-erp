'use client'

import { ClipboardList } from 'lucide-react'

export function StaffActivityTab({ staffId }: { staffId: string }) {
  return (
    <div className="rounded-xl border p-8 text-center text-muted-foreground" data-staff-id={staffId}>
      <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p className="font-medium">Activity Log</p>
      <p className="text-sm mt-1">
        Audit log entries for this staff member will appear here.
      </p>
    </div>
  )
}
