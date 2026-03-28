import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { StaffRolesClient } from '@/features/staff/components/StaffRolesClient'

export default async function StaffRolesPage() {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    redirect('/auth/login')
  }

  return <StaffRolesClient />
}
