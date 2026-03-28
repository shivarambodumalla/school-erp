import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { StaffListClient } from '@/features/staff/components/StaffListClient'

export default async function StaffPage() {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') redirect('/auth/login')
  return <StaffListClient />
}
