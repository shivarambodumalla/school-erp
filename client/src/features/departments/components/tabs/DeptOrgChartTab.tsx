'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface StaffMember {
  id: string; firstName: string; lastName: string; designation: string; serialNo?: string
  primaryRole: { name: string } | null
}

interface Props {
  department: {
    color: string; hodId: string | null; deputyHodId: string | null
    hod: { id: string; firstName: string; lastName: string; designation: string } | null
    deputyHod: { id: string; firstName: string; lastName: string; designation: string } | null
  }
  staff: StaffMember[]
}

export function DeptOrgChartTab({ department: dept, staff }: Props) {
  const others = staff.filter((s) => s.id !== dept.hodId && s.id !== dept.deputyHodId)

  return (
    <div className="pt-6 flex flex-col items-center gap-0">
      {/* School Admin */}
      <OrgNode name="School Admin" subtitle="Administrator" color="#f59e0b" dashed />
      <Connector />

      {/* HOD */}
      {dept.hod ? (
        <OrgNode name={`${dept.hod.firstName} ${dept.hod.lastName}`}
          subtitle="Head of Department" color={dept.color} badge="HOD" />
      ) : (
        <OrgNode name="Vacant" subtitle="Head of Department" color="#9ca3af" dashed />
      )}

      {/* Deputy HOD */}
      {dept.deputyHod && (
        <>
          <Connector />
          <OrgNode name={`${dept.deputyHod.firstName} ${dept.deputyHod.lastName}`}
            subtitle="Deputy HOD" color={dept.color} muted />
        </>
      )}

      {/* Staff */}
      {others.length > 0 && (
        <>
          <Connector />
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl">
            {others.map((s) => (
              <Link key={s.id} href={`/management/staff/${s.id}`}
                className="rounded-lg border p-3 text-center hover:shadow-md transition-shadow min-w-[140px]">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold mx-auto">
                  {s.firstName[0]}{s.lastName[0]}
                </div>
                <p className="text-sm font-medium mt-1.5 truncate">{s.firstName} {s.lastName}</p>
                <p className="text-xs text-muted-foreground truncate">{s.designation}</p>
                {s.primaryRole && (
                  <Badge variant="secondary" className="text-[10px] mt-1">{s.primaryRole.name}</Badge>
                )}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function OrgNode({ name, subtitle, color, badge, dashed, muted }: {
  name: string; subtitle: string; color: string; badge?: string; dashed?: boolean; muted?: boolean
}) {
  return (
    <div className={`rounded-xl border-2 px-6 py-4 text-center min-w-[200px] max-w-xs
      ${dashed ? 'border-dashed' : 'border-solid'} ${muted ? 'opacity-80' : ''}`}
      style={{ borderColor: color }}>
      <p className="font-semibold text-sm">{name}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
      {badge && (
        <Badge className="mt-1.5 text-xs text-white" style={{ backgroundColor: color }}>{badge}</Badge>
      )}
    </div>
  )
}

function Connector() {
  return (
    <div className="w-px h-6 bg-border" />
  )
}
