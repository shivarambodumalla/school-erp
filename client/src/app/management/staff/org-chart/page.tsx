import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { OrgChartClient } from '@/features/staff/components/OrgChartClient'

export default async function OrgChartPage() {
  const session = await auth()
  if (!session || session.user.portalType !== 'ADMIN') redirect('/auth/login')
  return <OrgChartClient />
}
