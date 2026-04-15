'use client'

import { useState, useEffect, useCallback } from 'react'
import { useInstitutionId } from '@/hooks/useInstitutionId'
import { ArrowLeft, Mail, Phone, Calendar, Building2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StaffOverviewTab } from './tabs/StaffOverviewTab'
import { StaffSubjectsTab } from './tabs/StaffSubjectsTab'
import { StaffDocumentsTab } from './tabs/StaffDocumentsTab'
import { StaffPerformanceTab } from './tabs/StaffPerformanceTab'
import { StaffActivityTab } from './tabs/StaffActivityTab'
import { StaffLeaveTab } from './tabs/StaffLeaveTab'
import { StaffAttendanceTab } from './tabs/StaffAttendanceTab'
import { StaffPayrollTab } from './tabs/StaffPayrollTab'
import { generateColor, STAFF_STATUS_COLORS } from '@/lib/colors'
import type { StaffDetail } from '../types'

export function StaffProfileClient({ staffId }: { staffId: string }) {
  const router = useRouter()
  const { apiParam } = useInstitutionId()
  const [staff, setStaff] = useState<StaffDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStaff = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/school/staff/${staffId}${apiParam}`)
    if (res.ok) {
      const data = (await res.json()) as StaffDetail
      setStaff(data)
    }
    setLoading(false)
  }, [staffId])

  useEffect(() => { fetchStaff() }, [fetchStaff])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-24 rounded-xl bg-muted animate-pulse" />
        <div className="h-96 rounded-xl bg-muted animate-pulse" />
      </div>
    )
  }

  if (!staff) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Staff member not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" className="shrink-0 mt-1"
          onClick={() => router.push('/management/staff')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="h-14 w-14 rounded-full shrink-0 flex items-center justify-center
          text-gray-800 text-xl font-bold" style={{ backgroundColor: generateColor(staff.firstName) }}>
          {staff.firstName[0]}{staff.lastName[0]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">
              {staff.firstName} {staff.lastName}
            </h1>
            <Badge variant="secondary"
              className={STAFF_STATUS_COLORS[staff.status] ?? ''}>
              {staff.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">{staff.designation}</p>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
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
          <StaffOverviewTab staff={staff} onStatusChanged={fetchStaff} />
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
