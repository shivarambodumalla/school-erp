import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { ReportCardClient } from
  '@/features/report-cards/components/ReportCardClient'

export default async function ReportCardsPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')
  return <ReportCardClient />
}
