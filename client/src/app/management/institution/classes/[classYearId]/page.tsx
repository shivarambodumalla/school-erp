import { auth } from '@/server/auth'
import { redirect, notFound } from 'next/navigation'
import { resolveClassYearId } from '@/lib/resolve-id'
import { SectionsTab } from '@/features/classes/components/tabs/SectionsTab'

interface Props {
  params: Promise<{ classYearId: string }>
}

export default async function ClassOverviewPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/auth/login')
  if (session.user.portalType !== 'ADMIN') redirect('/management/dashboard')

  const { classYearId: rawId } = await params
  const classYearId = await resolveClassYearId(rawId, session.user.institutionId)
  if (!classYearId) notFound()

  return <SectionsTab classYearId={classYearId} />
}
