'use client'

import { useEffect, useState, useCallback } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { Mail, Phone, Calendar, Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StaffOverviewTab } from './tabs/StaffOverviewTab'
import { StaffSubjectsTab } from './tabs/StaffSubjectsTab'
import { StaffDocumentsTab } from './tabs/StaffDocumentsTab'
import { StaffPerformanceTab } from './tabs/StaffPerformanceTab'
import { StaffActivityTab } from './tabs/StaffActivityTab'
import { StaffLeaveTab } from './tabs/StaffLeaveTab'
import { StaffAttendanceTab } from './tabs/StaffAttendanceTab'
import { StaffPayrollTab } from './tabs/StaffPayrollTab'
import type { StaffDetail } from '../types'

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-emerald-500',
  'bg-amber-500', 'bg-rose-500', 'bg-indigo-500',
]

function getColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] ?? 'bg-gray-500'
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-600',
  ON_LEAVE: 'bg-yellow-100 text-yellow-700',
  TERMINATED: 'bg-red-100 text-red-700',
}

export function StaffDetailInline({ staffId }: { staffId: string }) {
  const { apiParam } = useInstitutionId()
  const [staff, setStaff] = useState<StaffDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchStaff = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(`/api/school/staff/${staffId}${apiParam}`)
      if (!res.ok) throw new Error('Not found')
      setStaff((await res.json()) as StaffDetail)
    } catch {
      setError(true)
    }
    setLoading(false)
  }, [staffId, apiParam])

  useEffect(() => { fetchStaff() }, [fetchStaff])

  if (loading) {
    return (
      <div className="space-y-6 pt-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-muted animate-pulse shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-48 rounded bg-muted animate-pulse" />
            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div className="h-64 rounded-xl bg-muted animate-pulse" />
      </div>
    )
  }

  if (error || !staff) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50
        p-6 text-center text-red-700 text-sm mt-4">
        Failed to load staff profile. Please try again.
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-2">
      {/* Hero */}
      <div className="flex items-start gap-4">
        <div className={`h-14 w-14 rounded-full shrink-0 flex items-center
          justify-center text-white text-xl font-bold
          ${getColor(staff.firstName)}`}>
          {staff.firstName[0]}{staff.lastName[0]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">
              {staff.firstName} {staff.lastName}
            </h1>
            <Badge variant="secondary"
              className={STATUS_COLORS[staff.status] ?? ''}>
              {staff.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">{staff.designation}</p>
          <div className="flex flex-wrap gap-4 mt-2 text-sm
            text-muted-foreground">
            <span className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {staff.employeeNo}
            </span>
            {staff.department && (
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                {staff.department.name}
              </span>
            )}
            {staff.user?.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {staff.user.email}
              </span>
            )}
            {staff.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                {staff.phone}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Joined {new Date(staff.joiningDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <StaffOverviewTab staff={staff} />
        </TabsContent>
        <TabsContent value="subjects">
          <StaffSubjectsTab staff={staff} />
        </TabsContent>
        <TabsContent value="leave">
          <StaffLeaveTab staffId={staff.id} isOwnProfile={false} />
        </TabsContent>
        <TabsContent value="attendance">
          <StaffAttendanceTab staffId={staff.id} />
        </TabsContent>
        <TabsContent value="payroll">
          <StaffPayrollTab
            staffId={staff.id}
            staffName={`${staff.firstName} ${staff.lastName}`}
            employeeNo={staff.employeeNo}
            designation={staff.designation}
          />
        </TabsContent>
        <TabsContent value="documents">
          <StaffDocumentsTab staffId={staff.id} />
        </TabsContent>
        <TabsContent value="performance">
          <StaffPerformanceTab staffId={staff.id} />
        </TabsContent>
        <TabsContent value="activity">
          <StaffActivityTab staffId={staff.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
