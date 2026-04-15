import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { LeadAnalytics } from '@/features/leads/components/LeadAnalytics'

export default async function AnalyticsPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')
  return <LeadAnalytics />
}
