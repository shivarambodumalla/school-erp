import { auth } from '@/server/auth'
import { redirect, notFound } from 'next/navigation'
import { resolveClassYearId } from '@/lib/resolve-id'
import { SubjectsListContent } from '@/features/classes/components/pages/SubjectsListContent'

interface Props {
  params: Promise<{ classYearId: string }>
}

export default async function ClassSubjectsPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/auth/login')
  if (session.user.portalType !== 'ADMIN') redirect('/management/dashboard')

  const { classYearId: rawId } = await params
  const classYearId = await resolveClassYearId(rawId, session.user.institutionId)
  if (!classYearId) notFound()

  return <SubjectsListContent classYearId={classYearId} />
}
