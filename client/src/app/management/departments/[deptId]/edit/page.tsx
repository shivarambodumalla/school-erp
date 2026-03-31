import { auth } from '@/server/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { EditDepartmentClient } from '@/features/departments/components/EditDepartmentClient'

interface SerializedDept {
  id: string; name: string; description: string | null; color: string
  avatarUrl: string | null; status: 'ACTIVE' | 'INACTIVE'
  hodId: string | null; deputyHodId: string | null; hodSince: string | null
  subjectNames: string[]; createdAt: string
  hod: { id: string; firstName: string; lastName: string; designation: string; user: { email: string } | null } | null
  deputyHod: { id: string; firstName: string; lastName: string; designation: string } | null
  _count: { staff: number; announcements: number }
}

interface Props {
  params: Promise<{ deptId: string }>
}

export default async function EditDepartmentPage({ params }: Props) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') redirect('/auth/login')

  const { deptId } = await params
  const dept = await prisma.department.findUnique({
    where: { id: deptId },
    include: {
      hod: { include: { user: { select: { email: true } } } },
      deputyHod: true,
      _count: { select: { staff: true, announcements: true } },
    },
  })

  if (!dept || dept.institutionId !== session.user.institutionId) notFound()

  const serialized = JSON.parse(JSON.stringify(dept)) as SerializedDept

  return <EditDepartmentClient department={serialized} isAdmin />
}
