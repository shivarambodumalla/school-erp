import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { LeaveManagementClient } from
  '@/features/staff/components/LeaveManagementClient'

export default async function StaffLeavesPage() {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') {
    redirect('/auth/login')
  }

  return <LeaveManagementClient />
}
