import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { MarketingLeadsClient } from '@/features/super/components/MarketingLeadsClient'

export default async function SuperMarketingLeadsPage(): Promise<JSX.Element> {
  const session = await auth()
  if (!session || session.user.portalType !== 'SUPER_ADMIN') {
    redirect('/auth/login')
  }
  return <MarketingLeadsClient />
}
