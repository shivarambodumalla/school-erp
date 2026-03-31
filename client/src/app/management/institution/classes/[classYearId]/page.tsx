import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import { SectionsTab } from '@/features/classes/components/tabs/SectionsTab'

interface Props {
  params: Promise<{ classYearId: string }>
}

export default async function ClassOverviewPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/auth/login')
  if (session.user.portalType !== 'ADMIN') redirect('/management/dashboard')

  const { classYearId } = await params

  return <SectionsTab classYearId={classYearId} />
}
