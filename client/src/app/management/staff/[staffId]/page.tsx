import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { StaffProfileClient } from
  '@/features/staff/components/StaffProfileClient'

export default async function StaffDetailPage({
  params,
}: {
  params: Promise<{ staffId: string }>
}) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') redirect('/auth/login')
  const { staffId } = await params
  return <StaffProfileClient staffId={staffId} />
}
