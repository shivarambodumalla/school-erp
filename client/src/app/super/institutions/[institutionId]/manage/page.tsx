import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import {
  Users, UserCheck, ClipboardList,
  LayoutGrid, CalendarCheck, CreditCard, BookOpen, Settings,
} from 'lucide-react'
import Link from 'next/link'

const CARDS = [
  { label: 'Students', icon: Users, path: '/students', desc: 'View and manage all students' },
  { label: 'Staff', icon: UserCheck, path: '/staff', desc: 'Staff directory and management' },
  { label: 'Admissions', icon: ClipboardList, path: '/admissions', desc: 'Admissions pipeline' },
  { label: 'Classes', icon: LayoutGrid, path: '/institution/classes', desc: 'Class structure and sections' },
  { label: 'Attendance', icon: CalendarCheck, path: '/attendance', desc: 'Mark and review attendance' },
  { label: 'Fees', icon: CreditCard, path: '/fees', desc: 'Fee collection and reports' },
  { label: 'Courses', icon: BookOpen, path: '/courses', desc: 'LMS courses management' },
  { label: 'Settings', icon: Settings, path: '/settings', desc: 'School configuration' },
]

export default async function SuperManageDashboard({
  params,
}: {
  params: { institutionId: string }
}) {
  const institution = await prisma.institution.findUnique({
    where: { id: params.institutionId },
    select: {
      name: true,
      _count: { select: { users: true, students: true } },
    },
  })

  if (!institution) redirect('/super/institutions')

  const base = `/super/institutions/${params.institutionId}/manage`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{institution.name}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {institution._count.students} students · {institution._count.users} users
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CARDS.map((card) => (
          <Link
            key={card.path}
            href={`${base}${card.path}`}
            className="flex flex-col gap-3 p-5 rounded-xl border
              bg-card hover:bg-accent/50 transition-colors min-h-[120px]"
          >
            <card.icon className="h-6 w-6 text-primary" />
            <div>
              <p className="font-semibold">{card.label}</p>
              <p className="text-xs text-muted-foreground">{card.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
