import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { StaffProfileClient } from
  '@/features/staff/components/StaffProfileClient'

export default async function SuperManageStaffDetail({
  params,
}: {
  params: { institutionId: string; staffId: string }
}) {
  const staff = await prisma.staff.findFirst({
    where: { id: params.staffId, institutionId: params.institutionId },
    select: { id: true },
  })

  if (!staff) notFound()

  return <StaffProfileClient staffId={staff.id} />
}
