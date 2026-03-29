import { redirect } from 'next/navigation'
import { auth } from '@/server/auth'
import { FeeSettingsClient } from '@/features/fees/components/FeeSettingsClient'

export default async function FeeSettingsPage() {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') redirect('/auth/login')
  return <FeeSettingsClient />
}