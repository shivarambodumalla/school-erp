import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { NotificationsPageClient } from '@/features/notifications/components/NotificationsPageClient'

export default async function NotificationsPage() {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') redirect('/auth/login')
  return <NotificationsPageClient />
}
