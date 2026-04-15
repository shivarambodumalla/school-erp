import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { FollowUpList } from '@/features/leads/components/FollowUpList'

export default async function FollowUpsPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')
  return <FollowUpList />
}
