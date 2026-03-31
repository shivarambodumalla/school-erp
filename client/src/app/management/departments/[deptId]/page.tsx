import { auth } from '@/server/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { DepartmentDetailClient } from '@/features/departments/components/DepartmentDetailClient'

interface SerializedDept {
  id: string; name: string; description: string | null; color: string
  avatarUrl: string | null; status: 'ACTIVE' | 'INACTIVE'
  hodId: string | null; deputyHodId: string | null; hodSince: string | null
  subjectNames: string[]; createdAt: string
  hod: { id: string; firstName: string; lastName: string; designation: string; user: { email: string } | null } | null
  deputyHod: { id: string; firstName: string; lastName: string; designation: string; user: { email: string } | null } | null
  staff: { id: string; firstName: string; lastName: string; designation: string; serialNo?: string; primaryRole: { name: string } | null; reportsTo: { firstName: string; lastName: string } | null }[]
  announcements: { id: string; title: string; content: string; createdAt: string; createdBy: { email: string } }[]
  _count: { staff: number; announcements: number }
}

interface Props {
  params: Promise<{ deptId: string }>
}

export default async function DepartmentDetailPage({ params }: Props) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') redirect('/auth/login')

  const { deptId } = await params
  const dept = await prisma.department.findUnique({
    where: { id: deptId },
    include: {
      hod: {
        include: { user: { select: { email: true } } },
      },
      deputyHod: {
        include: { user: { select: { email: true } } },
      },
      staff: {
        include: {
          primaryRole: { select: { name: true } },
          reportsTo: { select: { firstName: true, lastName: true } },
        },
      },
      announcements: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { createdBy: { select: { email: true } } },
      },
      _count: { select: { staff: true, announcements: true } },
    },
  })

  if (!dept || dept.institutionId !== session.user.institutionId) notFound()

  // JSON serialize to convert Date objects to strings for client component
  const serialized = JSON.parse(JSON.stringify(dept)) as SerializedDept

  return <DepartmentDetailClient department={serialized} isAdmin />
}
