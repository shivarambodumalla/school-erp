import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { StaffIdCardPreview } from
  '@/features/staff/components/StaffIdCardPreview'

export default async function StaffIdCardPage({
  params,
}: {
  params: Promise<{ staffId: string }>
}) {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') redirect('/auth/login')
  const { staffId } = await params
  return <StaffIdCardPreview staffId={staffId} />
}
