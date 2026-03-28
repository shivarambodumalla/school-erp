import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { StaffSettingsClient } from '@/features/settings/components/StaffSettingsClient'

export default async function StaffSettingsPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')
  if (session.user.portalType !== 'ADMIN') redirect('/management/dashboard')

  return <StaffSettingsClient />
}
