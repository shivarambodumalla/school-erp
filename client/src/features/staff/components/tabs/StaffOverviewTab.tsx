'use client'

import { useState } from 'react'
import { Users, GraduationCap, FileText, Calendar } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { getErrorMessage, isDependencyError } from '@/lib/api-error-handler'
import type { StaffDetail } from '../../types'

interface CascadeResponse {
  requiresConfirmation: boolean
  warnings: string[]
}

function isCascadeResponse(data: unknown): data is CascadeResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'requiresConfirmation' in data &&
    (data as CascadeResponse).requiresConfirmation === true &&
    'warnings' in data &&
    Array.isArray((data as CascadeResponse).warnings)
  )
}

export function StaffOverviewTab({ staff, onStatusChanged }: { staff: StaffDetail; onStatusChanged?: () => void }) {
  const { apiParam } = useInstitutionId()
  const confirm = useConfirm()
  const [changingStatus, setChangingStatus] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    setChangingStatus(true)
    try {
      const res = await fetch(`/api/school/staff/${staff.id}${apiParam}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        toast.success(`Staff status changed to ${newStatus.toLowerCase()}`)
        onStatusChanged?.()
        return
      }
      const data = await res.json().catch(() => ({ error: 'Something went wrong' })) as Record<string, unknown>

      // Handle cascade confirmation flow
      if (isCascadeResponse(data)) {
        const warningList = (data as CascadeResponse).warnings.join('\n- ')
        const ok = await confirm({
          title: 'Confirm Status Change',
          description: `Changing status will have the following effects:\n\n- ${warningList}`,
          note: 'This may affect active assignments for this staff member.',
          destructive: true,
          confirmLabel: 'Proceed',
        })
        if (!ok) return
        // Re-send with cascade confirmation
        const cascadeRes = await fetch(`/api/school/staff/${staff.id}${apiParam}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus, confirmCascade: true }),
        })
        if (cascadeRes.ok) {
          toast.success(`Staff status changed to ${newStatus.toLowerCase()}`)
          onStatusChanged?.()
        } else {
          const errData = await cascadeRes.json().catch(() => ({ error: 'Failed to update status' })) as Record<string, unknown>
          toast.error(getErrorMessage(errData))
        }
        return
      }

      // Handle dependency block or other errors
      if (isDependencyError(data)) {
        toast.error(getErrorMessage(data), { duration: 6000 })
      } else {
        toast.error(getErrorMessage(data))
      }
    } catch {
      toast.error('Failed to update status')
    } finally {
      setChangingStatus(false)
    }
  }

  const canDeactivate = staff.status === 'ACTIVE'
  const canActivate = staff.status === 'INACTIVE' || staff.status === 'ON_LEAVE'
  return (
    <div className="grid md:grid-cols-2 gap-6 pt-4">
      {/* Quick Stats */}
      <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Direct Reports" value={staff.directReports.length} />
        <StatCard icon={GraduationCap} label="Subjects" value={staff.subjectTeaching.length} />
        <StatCard icon={Calendar} label="Leave Records" value={staff._count.leaves} />
        <StatCard icon={FileText} label="Documents" value={staff._count.documents} />
      </div>

      {/* Contact & Personal */}
      <div className="rounded-xl border p-4 space-y-3">
        <h3 className="font-semibold">Contact & Personal</h3>
        <InfoRow label="Phone" value={staff.phone} />
        <InfoRow label="Personal Email" value={staff.personalEmail} />
        <InfoRow label="Login Email" value={staff.user?.email} />
        <InfoRow label="Qualification" value={staff.qualification} />
        <InfoRow label="Specialization" value={staff.specialization} />
        <InfoRow label="Last Login"
          value={staff.user?.lastLoginAt
            ? new Date(staff.user.lastLoginAt).toLocaleString()
            : null} />
      </div>

      {/* Reporting Structure */}
      <div className="rounded-xl border p-4 space-y-3">
        <h3 className="font-semibold">Reporting Structure</h3>
        {staff.reportsTo ? (
          <div>
            <p className="text-xs text-muted-foreground">Reports To</p>
            <Link href={`/management/staff/${staff.reportsTo.id}`}
              className="text-sm font-medium text-primary hover:underline">
              {staff.reportsTo.firstName} {staff.reportsTo.lastName}
            </Link>
            <p className="text-xs text-muted-foreground">
              {staff.reportsTo.designation}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No reporting manager</p>
        )}
        {staff.directReports.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Direct Reports ({staff.directReports.length})
            </p>
            <div className="space-y-1">
              {staff.directReports.map(r => (
                <Link key={r.id} href={`/management/staff/${r.id}`}
                  className="block text-sm hover:underline">
                  {r.firstName} {r.lastName}
                  <span className="text-muted-foreground ml-1">
                    - {r.designation}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Class Teacher Assignments */}
      {staff.classTeaching.length > 0 && (
        <div className="rounded-xl border p-4 space-y-3">
          <h3 className="font-semibold">Class Teacher</h3>
          {staff.classTeaching.map(ct => (
            <div key={ct.id} className="text-sm">
              Section {ct.section.name}
              <span className="text-muted-foreground ml-1">
                ({ct.academicYear.name})
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Secondary Roles */}
      {staff.secondaryRoles.length > 0 && (
        <div className="rounded-xl border p-4 space-y-3">
          <h3 className="font-semibold">Additional Roles</h3>
          {staff.secondaryRoles.map(sr => (
            <div key={sr.id}
              className="inline-flex mr-2 mb-1 px-2 py-1 rounded-md bg-muted text-sm">
              {sr.staffRole.name}
            </div>
          ))}
        </div>
      )}

      {/* Status Actions */}
      {(canDeactivate || canActivate) && (
        <div className="md:col-span-2 rounded-xl border p-4 space-y-3">
          <h3 className="font-semibold">Status Actions</h3>
          <div className="flex items-center gap-3">
            {canDeactivate && (
              <Button variant="outline" size="sm" className="min-h-[44px]"
                disabled={changingStatus}
                onClick={() => handleStatusChange('INACTIVE')}>
                {changingStatus ? 'Updating...' : 'Deactivate Staff'}
              </Button>
            )}
            {canActivate && (
              <Button variant="outline" size="sm" className="min-h-[44px]"
                disabled={changingStatus}
                onClick={() => handleStatusChange('ACTIVE')}>
                {changingStatus ? 'Updating...' : 'Activate Staff'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
}) {
  return (
    <div className="rounded-xl border p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value ?? '-'}</span>
    </div>
  )
}
