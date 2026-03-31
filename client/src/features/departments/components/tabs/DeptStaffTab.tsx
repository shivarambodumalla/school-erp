'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StaffCard } from './staff/StaffCard'
import { AddStaffToDeptSheet } from './staff/AddStaffToDeptSheet'

interface DeptStaffMember {
  id: string; firstName: string; lastName: string; designation: string; serialNo?: string
  primaryRole: { name: string } | null
  reportsTo: { firstName: string; lastName: string } | null
}

interface Props {
  deptId: string
  hodId: string | null
  isAdmin: boolean
}

export function DeptStaffTab({ deptId, hodId, isAdmin }: Props) {
  const [staff, setStaff] = useState<DeptStaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)

  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch(`/api/school/departments/${deptId}/staff`)
      if (res.ok) setStaff(await res.json() as DeptStaffMember[])
    } catch { toast.error('Failed to load staff') }
    setLoading(false)
  }, [deptId])

  useEffect(() => { fetchStaff() }, [fetchStaff])

  const handleRemove = async (staffId: string) => {
    try {
      const res = await fetch(`/api/school/departments/${deptId}/staff`, {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId }),
      })
      if (res.ok) { toast.success('Staff removed from department'); fetchStaff() }
      else { const err = (await res.json()) as { error: string }; toast.error(err.error) }
    } catch { toast.error('Failed to remove staff') }
  }

  const hod = staff.find((s) => s.id === hodId)
  const others = staff.filter((s) => s.id !== hodId)

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Users className="h-4 w-4" /> Staff ({staff.length})
        </h3>
        {isAdmin && (
          <Button variant="outline" onClick={() => setSheetOpen(true)} className="gap-1.5 min-h-[44px]">
            <Plus className="h-4 w-4" /> Add Staff
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : staff.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-2" />
          <p className="font-medium">No staff in this department</p>
        </div>
      ) : (
        <>
          {hod && (
            <StaffCard staff={hod} isHod isAdmin={isAdmin} onRemove={handleRemove} />
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {others.map((s) => (
              <StaffCard key={s.id} staff={s} isHod={false} isAdmin={isAdmin} onRemove={handleRemove} />
            ))}
          </div>
        </>
      )}

      <AddStaffToDeptSheet open={sheetOpen} onClose={() => setSheetOpen(false)}
        deptId={deptId} onAdded={fetchStaff} existingStaffIds={staff.map((s) => s.id)} />
    </div>
  )
}
