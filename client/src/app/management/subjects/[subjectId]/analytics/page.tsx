import { auth } from '@/server/auth'
import { redirect, notFound } from 'next/navigation'
import { resolveSubjectId } from '@/lib/resolve-id'
import { AnalyticsView } from '@/features/subjects/components/AnalyticsView'

interface Props {
  params: Promise<{ subjectId: string }>
}

export default async function AnalyticsPage({ params }: Props) {
  const session = await auth()
  if (
    !session ||
    (session.user.portalType !== 'ADMIN' &&
      session.user.portalType !== 'TEACHER')
  ) {
    redirect('/auth/login')
  }

  const { subjectId: rawId } = await params
  const subjectId = await resolveSubjectId(rawId, session.user.institutionId)
  if (!subjectId) notFound()

  return <AnalyticsView subjectId={subjectId} />
}
