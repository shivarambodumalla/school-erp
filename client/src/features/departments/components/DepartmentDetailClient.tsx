'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, MoreHorizontal, UserPlus, Power, Trash2, Users, BookOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { getDeptInitials } from '../types'
import { DeptHeroCards } from './detail/DeptHeroCards'
import { DeptOverviewTab } from './tabs/DeptOverviewTab'
import { DeptStaffTab } from './tabs/DeptStaffTab'
import { DeptSubjectsTab } from './tabs/DeptSubjectsTab'
import { DeptOrgChartTab } from './tabs/DeptOrgChartTab'
import { DeptAnnouncementsTab } from './tabs/DeptAnnouncementsTab'

interface DeptStaff {
  id: string; firstName: string; lastName: string; designation: string; serialNo?: string
  primaryRole: { name: string } | null
  reportsTo: { firstName: string; lastName: string } | null
}

interface Announcement {
  id: string; title: string; content: string; createdAt: string
  createdBy: { email: string }
}

interface DepartmentFull {
  id: string; name: string; description: string | null; color: string
  avatarUrl: string | null; status: 'ACTIVE' | 'INACTIVE'
  hodId: string | null; deputyHodId: string | null; hodSince: string | null
  subjectNames: string[]; createdAt: string
  hod: { id: string; firstName: string; lastName: string; designation: string; user: { email: string } | null } | null
  deputyHod: { id: string; firstName: string; lastName: string; designation: string; user?: { email: string } | null } | null
  staff: DeptStaff[]; announcements: Announcement[]
  _count: { staff: number; announcements: number }
}

interface Props { department: DepartmentFull; isAdmin: boolean }

export function DepartmentDetailClient({ department: dept, isAdmin }: Props) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const initials = getDeptInitials(dept.name)

  return (
    <div className="space-y-6">
      {/* HERO */}
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="h-20 w-20 rounded-xl flex items-center justify-center text-white font-bold text-2xl shrink-0"
          style={{ backgroundColor: dept.color }}>
          {dept.avatarUrl ? <img src={dept.avatarUrl} alt={dept.name} className="h-full w-full rounded-xl object-cover" /> : initials}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold truncate">{dept.name}</h1>
          {dept.description && <p className="text-sm text-muted-foreground mt-1">{dept.description}</p>}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge className={dept.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'}>
              {dept.status}
            </Badge>
            <Badge variant="secondary" className="gap-1"><BookOpen className="h-3 w-3" />{dept.subjectNames.length} subjects</Badge>
            <Badge variant="secondary" className="gap-1"><Users className="h-3 w-3" />{dept._count.staff} staff</Badge>
          </div>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" onClick={() => router.push(`/management/departments/${dept.id}/edit`)} className="gap-1.5 min-h-[44px]">
              <Pencil className="h-4 w-4" /> Edit
            </Button>
            <div className="relative">
              <Button variant="outline" size="icon" onClick={() => setMenuOpen(!menuOpen)} className="min-h-[44px] min-w-[44px]">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              {menuOpen && <DeptMenu dept={dept} onClose={() => setMenuOpen(false)} />}
            </div>
          </div>
        )}
      </div>

      <DeptHeroCards department={dept} />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview" className="min-h-[44px]">Overview</TabsTrigger>
          <TabsTrigger value="staff" className="min-h-[44px]">Staff</TabsTrigger>
          <TabsTrigger value="subjects" className="min-h-[44px]">Subjects</TabsTrigger>
          <TabsTrigger value="orgchart" className="min-h-[44px]">Org Chart</TabsTrigger>
          <TabsTrigger value="announcements" className="min-h-[44px]">Announcements</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><DeptOverviewTab department={dept} /></TabsContent>
        <TabsContent value="staff"><DeptStaffTab deptId={dept.id} hodId={dept.hodId} isAdmin={isAdmin} /></TabsContent>
        <TabsContent value="subjects"><DeptSubjectsTab deptId={dept.id} subjectNames={dept.subjectNames} isAdmin={isAdmin} color={dept.color} /></TabsContent>
        <TabsContent value="orgchart"><DeptOrgChartTab department={dept} staff={dept.staff} /></TabsContent>
        <TabsContent value="announcements"><DeptAnnouncementsTab deptId={dept.id} isAdmin={isAdmin} /></TabsContent>
      </Tabs>
    </div>
  )
}

function DeptMenu({ dept, onClose }: { dept: { id: string }; onClose: () => void }) {
  const router = useRouter()
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-lg border bg-popover shadow-md py-1">
        <button type="button" className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted min-h-[44px]"
          onClick={() => { onClose(); router.push(`/management/departments/${dept.id}/edit`) }}>
          <UserPlus className="h-4 w-4" /> Change HOD
        </button>
        <button type="button" className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted min-h-[44px]"
          onClick={() => { onClose(); router.push(`/management/departments/${dept.id}/edit`) }}>
          <Power className="h-4 w-4" /> Deactivate
        </button>
        <button type="button" className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted min-h-[44px]"
          onClick={() => { onClose(); router.push(`/management/departments/${dept.id}/edit`) }}>
          <Trash2 className="h-4 w-4" /> Delete
        </button>
      </div>
    </>
  )
}
