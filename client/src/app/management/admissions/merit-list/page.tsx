import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { MeritListClient } from '@/features/admissions/components/MeritListClient'

export default async function MeritListPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')
  return <MeritListClient />
}
