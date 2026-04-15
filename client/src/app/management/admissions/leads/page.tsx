import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { LeadsClient } from '@/features/leads/components/LeadsClient'

export default async function LeadsPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')
  return <LeadsClient />
}
