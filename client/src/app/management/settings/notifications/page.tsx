import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { NotificationTemplatesClient } from '@/features/notifications/components/NotificationTemplatesClient'

export default async function NotificationTemplatesPage() {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') redirect('/auth/login')
  return <NotificationTemplatesClient />
}
