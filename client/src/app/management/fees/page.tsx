import { redirect } from 'next/navigation'
import { auth } from '@/server/auth'
import { FeesClient } from '@/features/fees/components/FeesClient'

export default async function FeesPage() {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') redirect('/auth/login')
  return <FeesClient />
}