import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { ClassesClient } from '@/features/classes/components/ClassesClient'

export default async function ClassesPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')
  if (session.user.portalType !== 'ADMIN') redirect('/management/dashboard')
  return <ClassesClient />
}
