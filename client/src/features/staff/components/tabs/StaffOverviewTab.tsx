'use client'

import { Users, GraduationCap, FileText, Calendar } from 'lucide-react'
import Link from 'next/link'
import type { StaffDetail } from '../../types'

export function StaffOverviewTab({ staff }: { staff: StaffDetail }) {
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
